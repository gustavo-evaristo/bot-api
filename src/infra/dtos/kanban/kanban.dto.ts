import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKanbanDto {
  @ApiProperty({ example: 'Pipeline de Vendas' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Acompanhamento de leads' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateKanbanDto {
  @ApiProperty({ example: 'Pipeline de Vendas' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Acompanhamento de leads' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateKanbanStageDto {
  @ApiProperty({ example: 'Dados Básicos' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateKanbanStageDto {
  @ApiProperty({ example: 'Dados Básicos' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}
