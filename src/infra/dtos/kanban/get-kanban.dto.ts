import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class GetKanbanDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: randomUUID() })
  id: string;
}
