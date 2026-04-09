import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListLeadsUseCase } from 'src/domain/use-cases/conversation/list-leads.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ListLeadsResponse } from 'src/infra/responses/lead/list-leads.response';

@ApiTags('Leads')
@Controller('leads')
export class ListLeadsController {
  constructor(private readonly listLeadsUseCase: ListLeadsUseCase) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all leads for the authenticated user' })
  @ApiOkResponse({ type: ListLeadsResponse })
  async listLeads(@Req() { user }: IReq) {
    return this.listLeadsUseCase.execute({ userId: user.id });
  }
}
