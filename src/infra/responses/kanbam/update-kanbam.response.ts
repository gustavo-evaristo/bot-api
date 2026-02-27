import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class UpdateKanbamResponse {
  @ApiProperty({ example: 'ok' })
  status: string;
}
