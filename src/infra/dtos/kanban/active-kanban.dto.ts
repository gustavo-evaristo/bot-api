import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class ActiveKanbanDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: randomUUID() })
  id: string;
}
