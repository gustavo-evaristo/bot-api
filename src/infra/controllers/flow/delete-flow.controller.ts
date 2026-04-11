import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteFlowUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Flow')
@Controller('flow')
export class DeleteFlowController {
  constructor(private readonly deleteFlowUseCase: DeleteFlowUseCase) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete flow' })
  @Delete(':flowId')
  async handle(@Param('flowId') flowId: string, @Req() { user }: IReq) {
    await this.deleteFlowUseCase.execute({ flowId, userId: user.id });

    return { status: 'ok' };
  }
}
