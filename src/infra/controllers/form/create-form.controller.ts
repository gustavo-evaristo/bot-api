import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFormUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateFormDTO } from 'src/infra/dtos/form/create-form.dto';
import { FormResponse } from 'src/infra/responses/form/form.response';

@ApiTags('Form')
@Controller('form')
export class CreateFormController {
  constructor(private readonly createFormUseCase: CreateFormUseCase) {}

  @ApiOperation({ summary: 'Create a new Form' })
  @ApiBody({ type: CreateFormDTO })
  @ApiOkResponse({ type: FormResponse })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  async createForm(
    @Body() { title, description }: CreateFormDTO,
    @Req() { user }: IReq,
  ) {
    const form = await this.createFormUseCase.execute({
      userId: user.id,
      title,
      description,
    });

    return {
      id: form.id.toString(),
      title: form.title,
      description: form.description,
      token: form.token,
      isActive: form.isActive,
      fields: [],
      responsesCount: 0,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }
}
