import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Olá! Posso te ajudar com alguma dúvida?' })
  content: string;
}
