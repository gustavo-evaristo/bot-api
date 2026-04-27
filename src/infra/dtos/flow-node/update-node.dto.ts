import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NodeType } from 'src/domain/entities/flow-node.entity';
import { NodeOptionDto } from './create-node.dto';

export class UpdateNodeDto {
  @ApiProperty({ enum: NodeType, example: NodeType.TEXT })
  @IsEnum(NodeType)
  type: NodeType;

  @ApiProperty({ example: 'Qual é o seu nome?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsUUID()
  defaultNextNodeId?: string | null;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsUUID()
  kanbanStageId?: string | null;

  @ApiPropertyOptional({ type: NodeOptionDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeOptionDto)
  options?: NodeOptionDto[];
}
