import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteStageUseCase } from 'src/domain/use-cases/stage/delete-stage.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Stage')
@Controller('stage')
export class DeleteStageController {
  constructor(private readonly deleteStageUseCase: DeleteStageUseCase) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete stage' })
  @Delete('/:stageId')
  async handle(@Param('stageId') stageId: string, @Req() { user }: IReq) {
    await this.deleteStageUseCase.execute({
      stageId,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
