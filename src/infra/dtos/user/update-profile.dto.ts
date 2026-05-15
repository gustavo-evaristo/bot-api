import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Jhon Doe' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @ApiPropertyOptional({ example: 'jhon@doe.com' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '+5511999999999' })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://...' })
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Minha Empresa' })
  companyName?: string;
}
