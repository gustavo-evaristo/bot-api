import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateFlowDTO } from 'src/infra/dtos/flow/update-flow.dto';
import { UpdateFlowResponse } from 'src/infra/responses/flow/update-flow.response';

@ApiTags('Flow')
@Controller('flow')
export class UpdateFlowController {
  constructor(private readonly updateFlowUseCase: UpdateFlowUseCase) {}

  @ApiOperation({ summary: 'Update a flow' })
  @ApiOkResponse({ type: UpdateFlowResponse })
  @ApiBody({ type: UpdateFlowDTO })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put()
  async updateFlow(
    @Body() { id, title }: UpdateFlowDTO,
    @Req() { user }: IReq,
  ) {
    await this.updateFlowUseCase.execute({
      id,
      userId: user.id,
      title,
    });

    return { status: 'ok' };
  }
}
