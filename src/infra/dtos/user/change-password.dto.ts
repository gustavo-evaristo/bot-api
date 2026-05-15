import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha precisa ter pelo menos 6 caracteres' })
  @ApiProperty()
  newPassword: string;

  @IsString()
  @ApiProperty()
  confirmPassword: string;
}
