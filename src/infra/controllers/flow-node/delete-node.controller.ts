import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteNodeUseCase } from 'src/domain/use-cases/flow-node/delete-node.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Flow Node')
@Controller('flow-node')
export class DeleteNodeController {
  constructor(private readonly deleteNodeUseCase: DeleteNodeUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Delete a flow node' })
  @Delete('/:nodeId')
  async handle(@Param('nodeId') nodeId: string, @Req() { user }: IReq) {
    await this.deleteNodeUseCase.execute({ userId: user.id, nodeId });

    return { status: 'ok' };
  }
}
