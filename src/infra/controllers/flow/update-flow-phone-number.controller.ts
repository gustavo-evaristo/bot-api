import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateFlowPhoneNumberUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateFlowPhoneNumberDTO } from 'src/infra/dtos/flow/update-flow-phone-number.dto';

@ApiTags('Flow')
@Controller('flow')
export class UpdateFlowPhoneNumberController {
  constructor(
    private readonly updateFlowPhoneNumberUseCase: UpdateFlowPhoneNumberUseCase,
  ) {}

  @ApiBody({ type: UpdateFlowPhoneNumberDTO })
  @ApiOperation({ summary: 'Update flow phone number' })
  @Post('/phone-number')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async handle(
    @Body() { id, phoneNumber }: UpdateFlowPhoneNumberDTO,
    @Req() { user }: IReq,
  ) {
    await this.updateFlowPhoneNumberUseCase.execute({
      id,
      phoneNumber,
      userId: user.id,
    });

    return { status: 'ok' };
  }
}
