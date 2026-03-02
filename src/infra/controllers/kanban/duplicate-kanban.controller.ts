import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { DuplicateKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { DuplicateKanbanDTO } from 'src/infra/dtos/kanban/duplicate-kanban.dto';
import { CreateKanbanResponse } from 'src/infra/responses/kanban/create-kanban.response';

@ApiTags('Kanban')
@Controller('kanban')
export class DuplicateKanbanController {
  constructor(
    private readonly duplicateKanbanUseCase: DuplicateKanbanUseCase,
  ) {}

  @ApiOperation({ summary: 'Duplicate kanban' })
  @ApiBody({ type: DuplicateKanbanDTO })
  @ApiOkResponse({ type: CreateKanbanResponse })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('duplicate')
  async handle(
    @Body() { kanbanId }: DuplicateKanbanDTO,
    @Req() { user }: IReq,
  ) {
    const kanban = await this.duplicateKanbanUseCase.execute({
      kanbanId,
      userId: user.id,
    });

    return {
      id: kanban.id.toString(),
      title: kanban.title,
      description: kanban.description,
      imageUrl: kanban.imageUrl,
    };
  }
}
