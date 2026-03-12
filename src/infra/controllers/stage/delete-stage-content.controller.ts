import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteStageContentUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Stage')
@Controller('stage')
export class DeleteStageContentController {
  constructor(
    private readonly deleteStageContentUseCase: DeleteStageContentUseCase,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete stage content' })
  @Delete('/content/:stageContentId')
  async handle(
    @Param('stageContentId') stageContentId: string,
    @Req() { user }: IReq,
  ) {
    await this.deleteStageContentUseCase.execute({
      stageContentId,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
