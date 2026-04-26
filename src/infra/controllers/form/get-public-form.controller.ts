import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPublicFormUseCase } from 'src/domain/use-cases';
import { FormResponse } from 'src/infra/responses/form/form.response';
import { serializeForm } from './form.serializer';

@ApiTags('Form')
@Controller('form/public')
export class GetPublicFormController {
  constructor(private readonly getPublicFormUseCase: GetPublicFormUseCase) {}

  @ApiOperation({ summary: 'Get a public Form by token (no auth required)' })
  @ApiOkResponse({ type: FormResponse })
  @Get(':token')
  async getPublicForm(@Param('token') token: string) {
    const form = await this.getPublicFormUseCase.execute({ token });
    return serializeForm(form);
  }
}
