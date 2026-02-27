import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export class LoginResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;
}
