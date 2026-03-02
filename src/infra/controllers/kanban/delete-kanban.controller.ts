import {
  Body,
  Controller,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteKanbanUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Kanban')
@Controller('kanban')
export class DeleteKanbanController {
  constructor(private readonly deleteKanbanUseCase: DeleteKanbanUseCase) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete kanban' })
  @Delete(':kanbanId')
  async handle(@Param('kanbanId') kanbanId: string, @Req() { user }: IReq) {
    await this.deleteKanbanUseCase.execute({ kanbanId, userId: user.id });

    return { status: 'ok' };
  }
}
