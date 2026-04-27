import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateNodeUseCase } from 'src/domain/use-cases/flow-node/update-node.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateNodeDto } from 'src/infra/dtos/flow-node/update-node.dto';

@ApiTags('Flow Node')
@Controller('flow-node')
export class UpdateNodeController {
  constructor(private readonly updateNodeUseCase: UpdateNodeUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: UpdateNodeDto })
  @ApiOperation({ summary: 'Update a flow node' })
  @Patch('/:nodeId')
  async handle(
    @Body() body: UpdateNodeDto,
    @Param('nodeId') nodeId: string,
    @Req() { user }: IReq,
  ) {
    await this.updateNodeUseCase.execute({
      userId: user.id,
      nodeId,
      type: body.type,
      content: body.content,
      defaultNextNodeId: body.defaultNextNodeId,
      kanbanStageId: body.kanbanStageId,
      x: body.x,
      y: body.y,
      options: body.options,
    });

    return { status: 'ok' };
  }
}
