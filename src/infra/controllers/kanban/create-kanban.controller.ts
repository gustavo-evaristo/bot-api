import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateKanbanDTO } from 'src/infra/dtos/kanban/create-kanban.dto';
import { CreateKanbanResponse } from 'src/infra/responses/kanban/create-kanban.response';

@ApiTags('Kanban')
@Controller('kanban')
export class CreateKanbanController {
  constructor(private readonly createKanbanUseCase: CreateKanbanUseCase) {}

  @ApiOperation({ summary: 'Create a new Kanban' })
  @ApiBody({ type: CreateKanbanDTO })
  @ApiOkResponse({ type: CreateKanbanResponse })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  async createKanban(
    @Body() { description, title }: CreateKanbanDTO,
    @Req() { user }: IReq,
  ) {
    const kanban = await this.createKanbanUseCase.execute({
      description,
      title,
      userId: user.id,
    });

    return {
      id: kanban.id.toString(),
      title: kanban.title,
      description: kanban.description,
    };
  }
}
