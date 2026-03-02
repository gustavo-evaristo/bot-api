import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class UpdateKanbanPhoneNumberDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: randomUUID() })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '+5511999999999' })
  phoneNumber: string;
}
