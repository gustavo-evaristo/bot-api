// whatsapp.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class BodyDTO {
  @ApiProperty({
    description: 'id do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  userId: string;
}

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private service: WhatsappService) {}

  @ApiBody({ type: BodyDTO })
  @Post('start')
  async start(@Body() { userId }: BodyDTO) {
    this.service.startSession(userId);
    return { message: 'Iniciando sessão...', userId };
  }
}
