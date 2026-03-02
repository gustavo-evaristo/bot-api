import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateKanbanPhoneNumberUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateKanbanPhoneNumberDTO } from 'src/infra/dtos/kanban/update-kanban-phone-number.dto';

@ApiTags('Kanban')
@Controller('kanban')
export class UpdateKanbanPhoneNumberController {
  constructor(
    private readonly updateKanbanPhoneNumberUseCase: UpdateKanbanPhoneNumberUseCase,
  ) {}

  @ApiBody({ type: UpdateKanbanPhoneNumberDTO })
  @ApiOperation({ summary: 'Update kanban phone number' })
  @Post('/phone-number')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async handle(
    @Body() { id, phoneNumber }: UpdateKanbanPhoneNumberDTO,
    @Req() { user }: IReq,
  ) {
    await this.updateKanbanPhoneNumberUseCase.execute({
      id,
      phoneNumber,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
