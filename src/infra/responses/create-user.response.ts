import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class CreateUserResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Jhon Doe' })
  name: string;

  @ApiProperty({ example: 'jhon.doe@example.com' })
  email: string;

  @ApiProperty({ example: '+5511999999999' })
  phone: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
}
