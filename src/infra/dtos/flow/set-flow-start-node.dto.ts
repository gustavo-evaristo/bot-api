import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class SetFlowStartNodeDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: randomUUID() })
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: randomUUID() })
  startNodeId: string;
}
