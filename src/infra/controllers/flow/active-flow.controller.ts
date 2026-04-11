import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ActiveFlowDTO } from 'src/infra/dtos/flow/active-flow.dto';

@ApiTags('Flow')
@Controller('flow')
export class ActiveFlowController {
  constructor(private readonly activeFlowUseCase: ActiveFlowUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: ActiveFlowDTO })
  @ApiOperation({ summary: 'Active flow' })
  @Post('/active')
  async handle(@Body() { id }: ActiveFlowDTO, @Req() { user }: IReq) {
    await this.activeFlowUseCase.execute({ id, userId: user.id });

    return { status: 'ok' };
  }
}
