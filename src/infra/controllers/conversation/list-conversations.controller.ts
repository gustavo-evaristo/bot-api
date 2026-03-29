import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListConversationsUseCase } from 'src/domain/use-cases/conversation/list-conversations.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ListConversationsResponse } from 'src/infra/responses/conversation/list-conversations.response';

@ApiTags('Conversations')
@Controller('conversations')
export class ListConversationsController {
  constructor(
    private readonly listConversationsUseCase: ListConversationsUseCase,
  ) {}

  @ApiOperation({ summary: 'List all conversations for the authenticated user' })
  @ApiOkResponse({ type: ListConversationsResponse })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get()
  async listConversations(@Req() { user }: IReq) {
    return this.listConversationsUseCase.execute({ userId: user.id });
  }
}
