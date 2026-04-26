import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListFormsUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { FormResponse } from 'src/infra/responses/form/form.response';
import { serializeForm } from './form.serializer';

@ApiTags('Form')
@Controller('form')
export class ListFormsController {
  constructor(private readonly listFormsUseCase: ListFormsUseCase) {}

  @ApiOperation({ summary: 'List all Forms for the authenticated user' })
  @ApiOkResponse({ type: [FormResponse] })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  async listForms(@Req() { user }: IReq) {
    const forms = await this.listFormsUseCase.execute({ userId: user.id });
    return forms.map(serializeForm);
  }
}
