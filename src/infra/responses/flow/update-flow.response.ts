import { ApiProperty } from '@nestjs/swagger';

export class UpdateFlowResponse {
  @ApiProperty({ example: 'ok' })
  status: string;
}
