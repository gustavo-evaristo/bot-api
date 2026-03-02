import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DesactiveKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { ActiveKanbanDTO } from 'src/infra/dtos/kanban/active-kanban.dto';

@ApiTags('Kanban')
@Controller('kanban')
export class DesactiveKanbanController {
  constructor(
    private readonly desactiveKanbanUseCase: DesactiveKanbanUseCase,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ActiveKanbanDTO })
  @ApiOperation({ summary: 'Desactive kanban' })
  @Post('desactive')
  async handle(@Body() { id }: ActiveKanbanDTO, @Req() { user }: IReq) {
    await this.desactiveKanbanUseCase.execute({ id, userId: user.id });
  }
}
