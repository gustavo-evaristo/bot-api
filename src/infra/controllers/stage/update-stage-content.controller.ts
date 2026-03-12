import { Body, Controller, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IContentType } from 'src/domain/entities/stage-content.entity';
import { UpdateStageContentUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateStageContentDTO } from 'src/infra/dtos/stage/update-stage-content.dto';

@ApiTags('Stage')
@Controller('stage')
export class UpdateStageContentController {
  constructor(
    private readonly updateStageContentUseCase: UpdateStageContentUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: UpdateStageContentDTO })
  @ApiOperation({ summary: 'Update stage content' })
  @Put('/content/:stageContentId')
  async handle(
    @Body() { content, contentType, answers }: UpdateStageContentDTO,
    @Param('stageContentId') stageContentId: string,
    @Req() { user }: IReq,
  ) {
    await this.updateStageContentUseCase.execute({
      userId: user.id,
      stageContentId,
      content,
      contentType: contentType as IContentType,
      answers,
    });

    return { status: 'ok' };
  }
}
