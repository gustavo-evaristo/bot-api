import { Body, Controller, Param, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateFormUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateFormDTO } from 'src/infra/dtos/form/update-form.dto';
import { FormResponse } from 'src/infra/responses/form/form.response';
import { serializeForm } from './form.serializer';
import { FormFieldType } from 'src/domain/entities/form-field.entity';

@ApiTags('Form')
@Controller('form')
export class UpdateFormController {
  constructor(private readonly updateFormUseCase: UpdateFormUseCase) {}

  @ApiOperation({ summary: 'Update a Form and its fields' })
  @ApiBody({ type: UpdateFormDTO })
  @ApiOkResponse({ type: FormResponse })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Put(':id')
  async updateForm(
    @Param('id') id: string,
    @Body() body: UpdateFormDTO,
    @Req() { user }: IReq,
  ) {
    const form = await this.updateFormUseCase.execute({
      formId: id,
      userId: user.id,
      title: body.title,
      description: body.description,
      fields: body.fields.map((f) => ({
        id: f.id,
        type: f.type as FormFieldType,
        title: f.title,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
        order: f.order,
      })),
    });

    return serializeForm(form);
  }
}
