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
import { GetKanbanResponse } from 'src/infra/responses/kanban/get-kanban.response';

@ApiTags('Kanban')
@Controller('kanban')
export class GetKanbanController {
  constructor(private readonly getKanbanUseCase: GetKanbanUseCase) {}

  @ApiOperation({
    summary: 'Find kanban by id',
  })
  @ApiOkResponse({ type: GetKanbanResponse })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get(':id')
  async getKanban(@Param() { id }: GetKanbanDTO, @Req() { user }: IReq) {
    return this.getKanbanUseCase.execute({
      id,
      userId: user.id,
    });
  }
}
