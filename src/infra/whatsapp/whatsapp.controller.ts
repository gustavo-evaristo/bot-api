import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../authentication/jwt.guard';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private service: WhatsappService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('start')
  async start(@Req() { user }: IReq) {
    const userId = user.id;

    this.service.startSession(userId);
    return { message: 'Iniciando sessão...', userId };
  }
}
