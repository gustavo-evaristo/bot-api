import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFlowDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Meu Flow' })
  title: string;
}
