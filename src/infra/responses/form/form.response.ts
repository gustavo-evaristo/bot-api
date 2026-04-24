import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class FormFieldOptionResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Opção 1' })
  label: string;
}

export class FormFieldResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'TEXT' })
  type: string;

  @ApiPropertyOptional({ example: 'Qual é o seu nome?' })
  title: string | null;

  @ApiProperty({ example: 'Nome completo' })
  label: string;

  @ApiPropertyOptional({ example: 'Digite seu nome...' })
  placeholder: string | null;

  @ApiProperty({ example: false })
  required: boolean;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty({ type: [FormFieldOptionResponse] })
  options: FormFieldOptionResponse[];
}

export class FormResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Pesquisa de satisfação' })
  title: string;

  @ApiPropertyOptional({ example: 'Formulário para coletar dados' })
  description: string | null;

  @ApiProperty({ example: randomUUID() })
  token: string;

  @ApiProperty({ example: false })
  isActive: boolean;

  @ApiProperty({ type: [FormFieldResponse] })
  fields: FormFieldResponse[];

  @ApiProperty({ example: 0 })
  responsesCount: number;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;
}
