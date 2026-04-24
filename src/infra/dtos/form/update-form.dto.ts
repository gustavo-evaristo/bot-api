import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const FIELD_TYPES = [
  'WELCOME_SCREEN',
  'THANK_YOU_SCREEN',
  'TEXT',
  'EMAIL',
  'PHONE',
  'NUMBER',
  'CPF',
  'ADDRESS',
  'REFERENCE',
  'MULTIPLE_CHOICE',
  'CHECKBOX',
  'SELECT',
] as const;

class FieldOptionDTO {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Opção 1' })
  label: string;
}

class FieldDTO {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsIn(FIELD_TYPES)
  @ApiProperty({ example: 'TEXT' })
  type: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Qual é o seu nome?' })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Nome completo' })
  label: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Digite seu nome...' })
  placeholder?: string;

  @IsBoolean()
  @ApiProperty({ example: false })
  required: boolean;

  @IsNumber()
  @ApiProperty({ example: 0 })
  order: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDTO)
  options?: FieldOptionDTO[];
}

export class UpdateFormDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Pesquisa de satisfação' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Formulário para coletar dados dos leads' })
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDTO)
  @ApiProperty({ type: [FieldDTO] })
  fields: FieldDTO[];
}
