import { ApiProperty } from '@nestjs/swagger';

export class LeadsByDateResponse {
  @ApiProperty({ example: '20/04' })
  date: string;

  @ApiProperty({ example: 10 })
  count: number;
}

export class MessagesByDayResponse {
  @ApiProperty({ example: '20/04' })
  date: string;

  @ApiProperty({ example: 45 })
  count: number;
}

export class ConversationStatusResponse {
  @ApiProperty({ example: 'FINISHED' })
  status: string;

  @ApiProperty({ example: 30 })
  count: number;
}

export class LeadsByFlowResponse {
  @ApiProperty({ example: 'Fluxo Vendas' })
  flow: string;

  @ApiProperty({ example: 20 })
  count: number;
}

export class MessagesByHourResponse {
  @ApiProperty({ example: 14 })
  hour: number;

  @ApiProperty({ example: 55 })
  count: number;
}

export class GetAnalyticsResponse {
  @ApiProperty({ example: 8 })
  messagesReceivedToday: number;

  @ApiProperty({ example: 3 })
  newLeadsToday: number;

  @ApiProperty({ example: 120 })
  totalLeads: number;

  @ApiProperty({ example: 350 })
  totalInteractions: number;

  @ApiProperty({ type: LeadsByDateResponse, isArray: true })
  leadsByDate: LeadsByDateResponse[];

  @ApiProperty({ type: MessagesByDayResponse, isArray: true })
  messagesByDay: MessagesByDayResponse[];

  @ApiProperty({ type: ConversationStatusResponse, isArray: true })
  conversationStatus: ConversationStatusResponse[];

  @ApiProperty({ type: LeadsByFlowResponse, isArray: true })
  leadsByFlow: LeadsByFlowResponse[];

  @ApiProperty({ type: MessagesByHourResponse, isArray: true })
  messagesByHour: MessagesByHourResponse[];
}
