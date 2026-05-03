import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateFlowDTO } from 'src/infra/dtos/flow/create-flow.dto';
import { CreateFlowResponse } from 'src/infra/responses/flow/create-flow.response';

@ApiTags('Flow')
@Controller('flow')
export class CreateFlowController {
  constructor(private readonly createFlowUseCase: CreateFlowUseCase) {}

  @ApiOperation({ summary: 'Create a new Flow' })
  @ApiBody({ type: CreateFlowDTO })
  @ApiOkResponse({ type: CreateFlowResponse })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  async createFlow(
    @Body() { title, description, kanbanId, phoneNumber }: CreateFlowDTO,
    @Req() { user }: IReq,
  ) {
    const flow = await this.createFlowUseCase.execute({
      title,
      description,
      kanbanId,
      phoneNumber,
      userId: user.id,
    });

    return {
      id: flow.id.toString(),
      title: flow.title,
      description: flow.description,
    };
  }
}
