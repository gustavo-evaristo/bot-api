import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class CreateStageDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: randomUUID() })
  kanbanId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Stage title' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Stage description' })
  description: string;
}
