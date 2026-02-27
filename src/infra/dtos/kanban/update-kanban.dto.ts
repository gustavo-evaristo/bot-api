import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class UpdateKanbanDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: randomUUID() })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Meu Kanban' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Descrição do meu Kanban' })
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'https://teste.com/image.png' })
  imageUrl: string;
}
