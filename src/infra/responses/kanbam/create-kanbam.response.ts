import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

export class CreateKanbamResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Meu Kanbam' })
  title: string;

  @ApiProperty({ example: 'Descrição do meu Kanbam' })
  description: string;
}
