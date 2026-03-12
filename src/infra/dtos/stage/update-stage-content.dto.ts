import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ContentType } from 'src/domain/entities/stage-content.entity';

export class AnswerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sim, já conheço o modelo de consignado' })
  content: string;

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @Min(0)
  @ApiProperty({ example: 1 })
  score: number;
}

export class UpdateStageContentDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Você já conhece o modelo de consignado?' })
  content: string;

  @IsEnum(ContentType)
  @IsNotEmpty()
  @ApiProperty({
    enum: ContentType,
    enumName: 'contentType',
    example: ContentType.MULTIPLE_CHOICE,
  })
  contentType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @ApiProperty({
    type: AnswerDto,
    isArray: true,
    required: false,
    example: [
      {
        content: 'Sim, já conheço o modelo de consignado',
        score: 1,
      },
      {
        content: 'Não conheço, gostaria que me explicasse',
        score: 0,
      },
    ],
  })
  answers?: AnswerDto[];
}
