import { Injectable, NotFoundException } from '@nestjs/common';
import { IFlowRepository } from 'src/domain/repositories';

interface Input {
  flowId: string;
  userId: string;
}

@Injectable()
export class DuplicateFlowUseCase {
  constructor(private readonly flowRepository: IFlowRepository) {}

  async execute({ flowId, userId }: Input): Promise<{ id: string }> {
    const source = await this.flowRepository.get(flowId);
    if (!source || source.userId.toString() !== userId) {
      throw new NotFoundException('Flow not found');
    }

    const newId = await this.flowRepository.duplicate(flowId, userId);
    return { id: newId };
  }
}
