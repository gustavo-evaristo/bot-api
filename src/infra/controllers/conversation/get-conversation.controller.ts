import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetConversationUseCase } from 'src/domain/use-cases/conversation/get-conversation.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { GetConversationResponse } from 'src/infra/responses/conversation/get-conversation.response';

@ApiTags('Conversations')
@Controller('conversations')
export class GetConversationController {
  constructor(
    private readonly getConversationUseCase: GetConversationUseCase,
  ) {}

  @ApiOperation({
    summary: 'Get conversation detail with full message history',
  })
  @ApiOkResponse({ type: GetConversationResponse })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':id')
  async getConversation(@Param('id') id: string, @Req() { user }: IReq) {
    return this.getConversationUseCase.execute({
      conversationId: id,
      userId: user.id,
    });
  }
}
