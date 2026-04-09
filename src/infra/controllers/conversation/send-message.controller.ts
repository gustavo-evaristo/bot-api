import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SendMessageUseCase } from 'src/domain/use-cases/conversation/send-message.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { WhatsappService } from 'src/infra/whatsapp/whatsapp.service';
import { SendMessageDTO } from 'src/infra/dtos/conversation/send-message.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class SendMessageController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Post(':conversationId/messages')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message to a lead (only allowed for FINISHED conversations)' })
  @ApiParam({ name: 'conversationId', type: String })
  @ApiBody({ type: SendMessageDTO })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() { content }: SendMessageDTO,
    @Req() { user }: IReq,
  ) {
    const { leadPhoneNumber } = await this.sendMessageUseCase.execute({
      conversationId,
      userId: user.id,
      content,
    });

    await this.whatsappService.sendMessage(user.id, leadPhoneNumber, content, conversationId);

    return { sent: true };
  }
}
