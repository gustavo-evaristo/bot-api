import { Injectable } from '@nestjs/common';
import { FlowEntity } from 'src/domain/entities/flow.entity';
import { IUserRepository } from 'src/domain/repositories';
import { IFlowRepository } from 'src/domain/repositories/flow.repository';

interface Input {
  id: string;
  userId: string;
}

@Injectable()
export class ActiveFlowUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ id, userId }: Input): Promise<FlowEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const flow = await this.flowRepository.get(id);

    if (!flow) {
      throw new Error('Flow not found');
    }

    if (!flow.belongsTo(user.id)) {
      throw new Error('User does not own this flow');
    }

    flow.active();

    await this.flowRepository.update(flow);

    return flow;
  }
}
