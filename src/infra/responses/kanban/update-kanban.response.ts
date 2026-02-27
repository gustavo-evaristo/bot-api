import { ApiProperty } from '@nestjs/swagger';

export class UpdateKanbanResponse {
  @ApiProperty({ example: 'ok' })
  status: string;
}
