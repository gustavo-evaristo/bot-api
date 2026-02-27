import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateKanbamUseCase } from 'src/domain/use-cases';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { UpdateKanbamDTO } from 'src/infra/dtos/kanbam/update-kanbam.dto';
import { UpdateKanbamResponse } from 'src/infra/responses/kanbam/update-kanbam.response';

@ApiTags('Kanbam')
@Controller('kanbam')
export class UpdateKanbamController {
  constructor(private readonly updateKanbamUseCase: UpdateKanbamUseCase) {}

  @ApiOperation({ summary: 'Update a kanbam' })
  @ApiOkResponse({ type: UpdateKanbamResponse })
  @ApiBody({ type: UpdateKanbamDTO })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put()
  async updateKanbam(
    @Body() { id, title, description, imageUrl }: UpdateKanbamDTO,
    @Req() { user }: IReq,
  ) {
    await this.updateKanbamUseCase.execute({
      id,
      userId: user.id,
      title,
      description,
      imageUrl,
    });

    return { status: 'ok' };
  }
}
