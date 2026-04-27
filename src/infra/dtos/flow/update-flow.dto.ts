import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class UpdateFlowDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: randomUUID() })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Meu Flow' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Fluxo de atendimento inicial ao lead' })
  description?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ example: null, nullable: true })
  kanbanId?: string | null;
}
