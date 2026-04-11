import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateNodeUseCase } from 'src/domain/use-cases/flow-node/create-node.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateNodeDto } from 'src/infra/dtos/flow-node/create-node.dto';

@ApiTags('Flow Node')
@Controller('flow-node')
export class CreateNodeController {
  constructor(private readonly createNodeUseCase: CreateNodeUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: CreateNodeDto })
  @ApiOperation({ summary: 'Create a flow node' })
  @Post()
  async handle(@Body() body: CreateNodeDto, @Req() { user }: IReq) {
    const node = await this.createNodeUseCase.execute({
      userId: user.id,
      flowId: body.flowId,
      type: body.type,
      content: body.content,
      defaultNextNodeId: body.defaultNextNodeId,
      x: body.x,
      y: body.y,
      options: body.options,
    });

    return { id: node.id.toString() };
  }
}
