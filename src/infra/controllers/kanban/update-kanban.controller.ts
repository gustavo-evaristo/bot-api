import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateKanbanDTO } from 'src/infra/dtos/kanban/update-kanban.dto';
import { UpdateKanbanResponse } from 'src/infra/responses/kanban/update-kanban.response';

@ApiTags('Kanban')
@Controller('kanban')
export class UpdateKanbanController {
  constructor(private readonly updateKanbanUseCase: UpdateKanbanUseCase) {}

  @ApiOperation({ summary: 'Update a kanban' })
  @ApiOkResponse({ type: UpdateKanbanResponse })
  @ApiBody({ type: UpdateKanbanDTO })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put()
  async updateKanban(
    @Body() { id, title, description, imageUrl }: UpdateKanbanDTO,
    @Req() { user }: IReq,
  ) {
    await this.updateKanbanUseCase.execute({
      id,
      userId: user.id,
      title,
      description,
      imageUrl,
    });

    return { status: 'ok' };
  }
}
