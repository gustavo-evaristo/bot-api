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

  @ApiProperty({ example: '+5511999999999' })
  phoneNumber: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  kanbanId: string | null;
}
