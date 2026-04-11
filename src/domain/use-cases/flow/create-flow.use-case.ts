import { Injectable } from '@nestjs/common';
import { FlowEntity } from 'src/domain/entities/flow.entity';
import { IFlowRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  title: string;
}

@Injectable()
export class CreateFlowUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ title, userId }: Input): Promise<FlowEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const flow = new FlowEntity({
      userId,
      title,
    });

    await this.flowRepository.create(flow);

    return flow;
  }
}
