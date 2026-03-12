import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStageDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Stage title' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Stage description' })
  description: string;
}
