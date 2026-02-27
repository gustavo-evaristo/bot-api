import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { GetKanbanDTO } from 'src/infra/dtos/kanban/get-kanban.dto';

@ApiTags('Kanban')
@Controller('kanban')
export class GetKanbanController {
  constructor(private readonly getKanbanUseCase: GetKanbanUseCase) {}

  @ApiOperation({
    summary: 'Find kanban by id',
  })
  @ApiOkResponse({ type: GetKanbanDTO })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':id')
  async getKanban(@Param() { id }: GetKanbanDTO, @Req() { user }: IReq) {
    const kanban = await this.getKanbanUseCase.execute({
      id,
      userId: user.id,
    });

    return {
      id: kanban.id.toString(),
      isActive: kanban.isActive,
      title: kanban.title,
      description: kanban.description,
      imageUrl: kanban.imageUrl,
      phoneNumber: kanban.phoneNumber,
      createdAt: kanban.createdAt,
    };
  }
}
