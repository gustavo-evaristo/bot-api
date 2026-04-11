import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetFlowStartNodeUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { SetFlowStartNodeDTO } from 'src/infra/dtos/flow/set-flow-start-node.dto';

@ApiTags('Flow')
@Controller('flow')
export class SetFlowStartNodeController {
  constructor(
    private readonly setFlowStartNodeUseCase: SetFlowStartNodeUseCase,
  ) {}

  @ApiBody({ type: SetFlowStartNodeDTO })
  @ApiOperation({ summary: 'Set flow start node' })
  @Post('/start-node')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async handle(
    @Body() { id, startNodeId }: SetFlowStartNodeDTO,
    @Req() { user }: IReq,
  ) {
    await this.setFlowStartNodeUseCase.execute({
      id,
      startNodeId,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
