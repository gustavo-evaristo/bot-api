import { ApiProperty } from '@nestjs/swagger';

export class LeadItemResponse {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: '+5511999999999' })
  leadPhoneNumber: string;

  @ApiProperty({ example: 'Maria Silva', nullable: true })
  leadName: string | null;

  @ApiProperty({ example: 'FINISHED', enum: ['ACTIVE', 'FINISHED'] })
  status: string;

  @ApiProperty({ example: new Date().toISOString() })
  createdAt: Date;
}

export class ListLeadsResponse {
  @ApiProperty({ type: LeadItemResponse, isArray: true })
  leads: LeadItemResponse[];
}
