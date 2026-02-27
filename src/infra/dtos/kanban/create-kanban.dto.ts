import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKanbanDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Meu Kanban' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Descrição do meu Kanban' })
  description: string;
}
