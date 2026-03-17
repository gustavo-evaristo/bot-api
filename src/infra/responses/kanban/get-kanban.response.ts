import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';

class AnswerResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Sim, já conheço o modelo de consignado' })
  content: string;

  @ApiProperty({ example: 1 })
  score: number;
}

class StageContentResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Você já conhece o modelo de consignado?' })
  content: string;

  @ApiProperty({ example: 'multiple_choice' })
  contentType: string;

  @ApiProperty({
    type: AnswerResponse,
    isArray: true,
    example: [
      {
        content: 'Sim, já conheço o modelo de consignado',
        score: 1,
      },
      {
        content: 'Não, gostaria que me explicasse como funciona',
        score: 0,
      },
    ],
  })
  answers: AnswerResponse[];
}

class StageResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Dados Básicos' })
  title: string;

  @ApiProperty({ example: 'Coleta inicial de dados do cliente' })
  description: string;

  @ApiProperty({
    type: StageContentResponse,
    isArray: true,
  })
  contents: StageContentResponse[];
}

export class GetKanbanResponse {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Meu Kanban' })
  title: string;

  @ApiProperty({ example: 'Fluxo de atendimento automático do WhatsApp' })
  description: string;

  @ApiProperty({ example: randomUUID() })
  userId: string;

  @ApiProperty({
    type: StageResponse,
    isArray: true,
  })
  stages: StageResponse[];
}
