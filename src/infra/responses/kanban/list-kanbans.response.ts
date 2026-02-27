import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export abstract class ListkanbansResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Meu kanban' })
  title: string;

  @ApiProperty({ example: 'Descrição do meu kanban' })
  description: string;

  @ApiProperty({ example: 'https://teste.com/image.png' })
  imageUrl: string;

  @ApiProperty({ example: '+5511999999999' })
  phoneNumber: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
}
