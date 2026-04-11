import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

class LastMessageResponse {
  @ApiProperty({ example: 'Olá, queria saber mais!' })
  content: string;

  @ApiProperty({ example: 'LEAD', enum: ['BOT', 'LEAD'] })
  sender: string;

  @ApiProperty({ example: new Date().toISOString() })
  sentAt: Date;
}

export class ConversationSummaryResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: '+5511999999999' })
  leadPhoneNumber: string;

  @ApiProperty({ example: 'Maria Silva', nullable: true })
  leadName: string | null;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'FINISHED'] })
  status: string;

  @ApiProperty({ example: randomUUID() })
  flowId: string;

  @ApiProperty({ example: 'Fluxo de cadastro de consultoras' })
  flowTitle: string;

  @ApiProperty({ type: LastMessageResponse, nullable: true })
  lastMessage: LastMessageResponse | null;

  @ApiProperty({ example: new Date().toISOString() })
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString() })
  updatedAt: Date;
}

export class ListConversationsResponse {
  @ApiProperty({ type: ConversationSummaryResponse, isArray: true })
  conversations: ConversationSummaryResponse[];
}
