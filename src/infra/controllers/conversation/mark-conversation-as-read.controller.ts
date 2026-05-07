import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MarkConversationAsReadUseCase } from 'src/domain/use-cases/conversation/mark-conversation-as-read.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Conversations')
@Controller('conversations')
export class MarkConversationAsReadController {
  constructor(
    private readonly markConversationAsReadUseCase: MarkConversationAsReadUseCase,
  ) {}

  @Post(':conversationId/mark-as-read')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Sinalizar todas as mensagens recebidas como lidas (envia read receipt ao WhatsApp)',
  })
  @ApiParam({ name: 'conversationId', type: String })
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Req() { user }: IReq,
  ) {
    await this.markConversationAsReadUseCase.execute({
      userId: user.id,
      conversationId,
    });
    return { ok: true };
  }
}
