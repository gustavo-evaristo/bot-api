import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class DuplicateKanbanDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: randomUUID() })
  kanbanId: string;
}
