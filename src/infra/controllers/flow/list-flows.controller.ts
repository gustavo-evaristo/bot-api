import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListFlowsUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ListFlowsResponse } from 'src/infra/responses/flow/list-flows.response';

@ApiTags('Flow')
@Controller('flow')
export class ListFlowsController {
  constructor(private readonly listFlowsUseCase: ListFlowsUseCase) {}

  @ApiOperation({ summary: 'List flows' })
  @ApiOkResponse({ type: ListFlowsResponse, isArray: true })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('list')
  async listFlows(@Req() { user }: IReq) {
    return this.listFlowsUseCase.execute(user.id);
  }
}
