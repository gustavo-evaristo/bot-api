import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { JwtGuard } from '../authentication/jwt.guard';

class StartWhatsappSessionDTO {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '+5511999999999', nullable: true })
  phoneNumber?: string | null;
}

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private service: WhatsappService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiBody({ type: StartWhatsappSessionDTO, required: false })
  @Post('start')
  async start(
    @Req() { user }: IReq,
    @Body() body?: StartWhatsappSessionDTO,
  ) {
    const userId = user.id;
    this.service.startSession(userId, body?.phoneNumber ?? null);
    return { message: 'Iniciando sessão...', userId };
  }
}
