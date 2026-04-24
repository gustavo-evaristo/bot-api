import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFormDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Pesquisa de satisfação' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Formulário para coletar dados dos leads' })
  description?: string;
}
