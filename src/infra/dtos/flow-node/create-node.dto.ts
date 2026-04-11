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

export class NodeOptionDto {
  @ApiProperty({ example: 'Sim, tenho interesse' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsUUID()
  nextNodeId?: string | null;
}

export class CreateNodeDto {
  @ApiProperty({ example: 'uuid-do-flow' })
  @IsUUID()
  flowId: string;

  @ApiProperty({ enum: NodeType, example: NodeType.TEXT })
  @IsEnum(NodeType)
  type: NodeType;

  @ApiProperty({ example: 'Olá! Como posso te ajudar?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsUUID()
  defaultNextNodeId?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  y?: number;

  @ApiPropertyOptional({ type: NodeOptionDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeOptionDto)
  options?: NodeOptionDto[];
}
