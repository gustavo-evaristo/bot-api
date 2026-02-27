import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateKanbamUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { CreateKanbamDTO } from 'src/infra/dtos/kanbam/create-kanbam.dto';
import { CreateKanbamResponse } from 'src/infra/responses/kanbam/create-kanbam.response';

@ApiTags('Kanbam')
@Controller('kanbam')
export class CreateKanbamController {
  constructor(private readonly createKanbamUseCase: CreateKanbamUseCase) {}

  @ApiOperation({ summary: 'Create a new Kanbam' })
  @ApiBody({ type: CreateKanbamDTO })
  @ApiOkResponse({ type: CreateKanbamResponse })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post()
  async createKanbam(
    @Body() { description, title }: CreateKanbamDTO,
    @Req() { user }: IReq,
  ) {
    const kanbam = await this.createKanbamUseCase.execute({
      description,
      title,
      userId: user.id,
    });

    return {
      id: kanbam.id.toString(),
      title: kanbam.title,
      description: kanbam.description,
    };
  }
}
