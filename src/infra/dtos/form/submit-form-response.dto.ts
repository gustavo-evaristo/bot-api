import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'field-uuid' })
  fieldId: string;

  @ApiProperty({ example: 'Resposta do usuário' })
  value: string | string[];
}

export class SubmitFormResponseDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  @ApiProperty({ type: [AnswerDTO] })
  answers: AnswerDTO[];
}
