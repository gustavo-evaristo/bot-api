import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export class CreateKanbanResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Meu Kanban' })
  title: string;

  @ApiProperty({ example: 'Descrição do meu Kanban' })
  description: string;
}
