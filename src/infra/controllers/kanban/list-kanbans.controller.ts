import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListKanbansUseCase } from 'src/domain/use-cases/kanban/list-kanbans.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ListkanbansResponse } from 'src/infra/responses/kanban/list-kanbans.response';

@ApiTags('Kanban')
@Controller('kanban')
export class ListKanbansController {
  constructor(private readonly listKanbansUseCase: ListKanbansUseCase) {}

  @ApiOkResponse({ type: ListkanbansResponse, isArray: true })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('list')
  async listKanbans(@Req() { user }: IReq) {
    const kanbans = await this.listKanbansUseCase.execute(user.id);

    return kanbans.map((kanban) => ({
      id: kanban.id.toString(),
      isActive: kanban.isActive,
      title: kanban.title,
      description: kanban.description,
      imageUrl: kanban.imageUrl,
      phoneNumber: kanban.phoneNumber,
      createdAt: kanban.createdAt,
    }));
  }
}
