import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateStageUseCase } from 'src/domain/use-cases/stage/update-stage.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateStageDTO } from 'src/infra/dtos/stage/update-stage.dto';

@ApiTags('Stage')
@Controller('stage')
export class UpdateStageController {
  constructor(private readonly updateStageUseCase: UpdateStageUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: UpdateStageDTO })
  @ApiOperation({ summary: 'Update kanban stage' })
  @Put('/:stageId')
  async handle(
    @Body() { title, description }: UpdateStageDTO,
    @Param('stageId') stageId: string,
    @Req() { user }: IReq,
  ) {
    await this.updateStageUseCase.execute({
      stageId,
      title,
      description,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
