import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export abstract class ListFlowsResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Meu flow' })
  title: string;

  @ApiPropertyOptional({ example: 'Fluxo de atendimento inicial ao lead' })
  description: string | null;

  @ApiPropertyOptional({ example: '+5511999999999', nullable: true })
  phoneNumber: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  kanbanId: string | null;

  @ApiPropertyOptional({ example: 'Captação de revendedoras', nullable: true })
  kanbanTitle: string | null;

  @ApiProperty({ example: 6 })
  leadsCount: number;

  @ApiProperty({ example: 234 })
  messagesCount: number;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;
}
