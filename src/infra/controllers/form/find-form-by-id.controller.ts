import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FindFormByIdUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { FormResponse } from 'src/infra/responses/form/form.response';
import { serializeForm } from './form.serializer';

@ApiTags('Form')
@Controller('form')
export class FindFormByIdController {
  constructor(private readonly findFormByIdUseCase: FindFormByIdUseCase) {}

  @ApiOperation({ summary: 'Get a Form by ID' })
  @ApiOkResponse({ type: FormResponse })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findFormById(@Param('id') id: string, @Req() { user }: IReq) {
    const form = await this.findFormByIdUseCase.execute({
      formId: id,
      userId: user.id,
    });

    return serializeForm(form);
  }
}
