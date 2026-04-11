import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { GetFlowResponse } from 'src/infra/responses/flow/get-flow.response';

@ApiTags('Flow')
@Controller('flow')
export class GetFlowController {
  constructor(private readonly getFlowUseCase: GetFlowUseCase) {}

  @ApiOperation({ summary: 'Get flow details' })
  @ApiOkResponse({ type: GetFlowResponse })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':id')
  async handle(@Param('id') id: string, @Req() { user }: IReq) {
    return this.getFlowUseCase.execute({ id, userId: user.id });
  }
}
