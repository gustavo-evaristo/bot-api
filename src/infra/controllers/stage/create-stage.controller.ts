import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateStageUseCase } from 'src/domain/use-cases/stage/create-stage.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateStageDTO } from 'src/infra/dtos/stage/create-stage.dto';

@ApiTags('Stage')
@Controller('stage')
export class CreateStageController {
  constructor(private readonly createStageUseCase: CreateStageUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: CreateStageDTO })
  @ApiOperation({ summary: 'Create kanban stage' })
  @Post('')
  async handle(
    @Body() { title, description, kanbanId }: CreateStageDTO,
    @Req() { user }: IReq,
  ) {
    await this.createStageUseCase.execute({
      kanbanId,
      title,
      description,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
