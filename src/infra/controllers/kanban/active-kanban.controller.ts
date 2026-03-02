import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ActiveKanbanDTO } from 'src/infra/dtos/kanban/active-kanban.dto';

@ApiTags('Kanban')
@Controller('kanban')
export class ActiveKanbanController {
  constructor(private readonly activeKanbanUseCase: ActiveKanbanUseCase) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: ActiveKanbanDTO })
  @ApiOperation({ summary: 'Active kanban' })
  @Post('/active')
  async handle(@Body() { id }: ActiveKanbanDTO, @Req() { user }: IReq) {
    await this.activeKanbanUseCase.execute({ id, userId: user.id });

    return { status: 'ok' };
  }
}
