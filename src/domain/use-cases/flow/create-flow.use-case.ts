import { Injectable } from '@nestjs/common';
import { FlowEntity } from 'src/domain/entities/flow.entity';
import { IFlowRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  title: string;
  description?: string | null;
  kanbanId?: string | null;
}

@Injectable()
export class CreateFlowUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ title, description, kanbanId, userId }: Input): Promise<FlowEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const flow = new FlowEntity({
      userId,
      title,
      description,
      kanbanId,
    });

    await this.flowRepository.create(flow);

    return flow;
  }
}
