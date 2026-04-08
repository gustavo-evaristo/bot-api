import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

class MessageResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'BOT', enum: ['BOT', 'LEAD'] })
  sender: string;

  @ApiProperty({ example: 'Olá! Bem-vindo ao nosso atendimento.' })
  content: string;

  @ApiProperty({ example: new Date().toISOString() })
  sentAt: Date;
}

export class GetConversationResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: '+5511999999999' })
  leadPhoneNumber: string;

  @ApiProperty({ example: 'Maria Silva', nullable: true })
  leadName: string | null;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'FINISHED'] })
  status: string;

  @ApiProperty({ example: 'Fluxo de cadastro de consultoras' })
  kanbanTitle: string;

  @ApiProperty({ type: MessageResponse, isArray: true })
  messages: MessageResponse[];

  @ApiProperty({ example: new Date().toISOString() })
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString() })
  updatedAt: Date;
}
