import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListFormResponsesUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';

@ApiTags('Form')
@Controller('form')
export class ListFormResponsesController {
  constructor(
    private readonly listFormResponsesUseCase: ListFormResponsesUseCase,
  ) {}

  @ApiOperation({ summary: 'List all responses for a Form' })
  @ApiOkResponse()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get(':id/responses')
  async listFormResponses(@Param('id') id: string, @Req() { user }: IReq) {
    return this.listFormResponsesUseCase.execute({
      formId: id,
      userId: user.id,
    });
  }
}
