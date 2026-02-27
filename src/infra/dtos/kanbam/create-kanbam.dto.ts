import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKanbamDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Meu Kanbam' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Descrição do meu Kanbam' })
  description: string;
}
