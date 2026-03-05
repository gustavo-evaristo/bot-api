import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ContentType,
  IContentType,
} from 'src/domain/entities/stage-content.entity';
import { CreateStageContentUseCase } from 'src/domain/use-cases/stage-content/create-stage.cotent.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateStageContentDTO } from 'src/infra/dtos/stage/create-stage-content.dto';

@ApiTags('Stage')
@Controller('stage')
export class CreateStageContentController {
  constructor(
    private readonly createStageContentUseCase: CreateStageContentUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: CreateStageContentDTO })
  @ApiOperation({ summary: 'Create stage content' })
  @Post('/:stageId/content')
  async handle(
    @Body() { content, contentType, answers }: CreateStageContentDTO,
    @Param('stageId') stageId: string,
    @Req() { user }: IReq,
  ) {
    await this.createStageContentUseCase.execute({
      userId: user.id,
      stageId,
      content,
      contentType: contentType as IContentType,
      answers,
    });

    return { status: 'ok' };
  }
}
