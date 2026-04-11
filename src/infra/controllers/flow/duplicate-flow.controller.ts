import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DuplicateFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { DuplicateFlowDTO } from 'src/infra/dtos/flow/duplicate-flow.dto';
import { CreateFlowResponse } from 'src/infra/responses/flow/create-flow.response';

@ApiTags('Flow')
@Controller('flow')
export class DuplicateFlowController {
  constructor(private readonly duplicateFlowUseCase: DuplicateFlowUseCase) {}

  @ApiOperation({ summary: 'Duplicate flow' })
  @ApiBody({ type: DuplicateFlowDTO })
  @ApiOkResponse({ type: CreateFlowResponse })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('duplicate')
  async handle(
    @Body() { flowId }: DuplicateFlowDTO,
    @Req() { user }: IReq,
  ) {
    const flow = await this.duplicateFlowUseCase.execute({
      flowId,
      userId: user.id,
    });

    return {
      id: flow.id.toString(),
      title: flow.title,
    };
  }
}
