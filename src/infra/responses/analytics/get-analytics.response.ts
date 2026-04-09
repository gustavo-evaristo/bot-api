import { ApiProperty } from '@nestjs/swagger';

export class LeadsByDayResponse {
  @ApiProperty({ example: 'Monday' })
  day: string;

  @ApiProperty({ example: 10 })
  count: number;
}

export class GetAnalyticsResponse {
  @ApiProperty({ example: 120 })
  totalLeads: number;

  @ApiProperty({ example: 350 })
  totalInteractions: number;

  @ApiProperty({ type: LeadsByDayResponse, isArray: true })
  leadsByDayOfWeek: LeadsByDayResponse[];
}
