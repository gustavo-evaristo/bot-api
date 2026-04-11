import { Injectable } from '@nestjs/common';
import { FlowDetails } from 'src/domain/entities/flow.entity';
import { IFlowRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  id: string;
}

@Injectable()
export class GetFlowUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly flowRepository: IFlowRepository,
  ) {}

  async execute({ id, userId }: Input): Promise<FlowDetails> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const flow = await this.flowRepository.getDetails(id);

    if (!flow) {
      throw new Error('Flow not found');
    }

    if (flow.userId !== userId) {
      throw new Error('User does not own this flow');
    }

    return flow;
  }
}
