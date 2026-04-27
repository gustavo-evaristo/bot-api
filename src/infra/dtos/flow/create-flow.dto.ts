import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFlowDTO {
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
