import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

class NodeOptionResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Sim, tenho interesse' })
  content: string;

  @ApiProperty({ example: 10 })
  score: number;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  nextNodeId: string | null;
}

class FlowNodeResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'QUESTION_MULTIPLE_CHOICE' })
  type: string;

  @ApiProperty({ example: 'Você já conhece o produto?' })
  content: string;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  defaultNextNodeId: string | null;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  kanbanStageId: string | null;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  formId: string | null;

  @ApiProperty({ example: 0 })
  x: number;

  @ApiProperty({ example: 0 })
  y: number;

  @ApiProperty({ type: NodeOptionResponse, isArray: true })
  options: NodeOptionResponse[];
}

export class GetFlowResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Meu Flow' })
  title: string;

  @ApiProperty({ example: randomUUID() })
  userId: string;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  kanbanId: string | null;

  @ApiPropertyOptional({ example: randomUUID(), nullable: true })
  startNodeId: string | null;

  @ApiProperty({ type: FlowNodeResponse, isArray: true })
  nodes: FlowNodeResponse[];
}
