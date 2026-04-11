import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DesactiveFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ActiveFlowDTO } from 'src/infra/dtos/flow/active-flow.dto';

@ApiTags('Flow')
@Controller('flow')
export class DesactiveFlowController {
  constructor(private readonly desactiveFlowUseCase: DesactiveFlowUseCase) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ActiveFlowDTO })
  @ApiOperation({ summary: 'Desactive flow' })
  @Post('desactive')
  async handle(@Body() { id }: ActiveFlowDTO, @Req() { user }: IReq) {
    await this.desactiveFlowUseCase.execute({ id, userId: user.id });

    return { status: 'ok' };
  }
}
