import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @ApiProperty({
    description: 'Must be a string',
    example: 'Jhon Doe',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @ApiProperty({
    description: 'Must be a valid email address',
    example: 'jhon@doe.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  @ApiProperty({
    description: 'Must be a valid phone number',
    example: '+5511999999999',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty({
    description:
      'Must be at least 8 characters long, contain letters and numbers and special characters',
    example: 'Password@123',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm Password is required' })
  @ApiProperty({
    description: 'Must be the same as password',
    example: 'Password@123',
  })
  confirmPassword: string;
}
