import { Injectable } from '@nestjs/common';
import { IFlowRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  flowId: string;
  userId: string;
}

@Injectable()
export class DeleteFlowUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ flowId, userId }: Input): Promise<void> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const flow = await this.flowRepository.get(flowId);

    if (!flow) {
      throw new Error('Flow not found');
    }

    if (!flow.belongsTo(user.id)) {
      throw new Error('User is not the owner of the flow');
    }

    flow.delete();

    await this.flowRepository.update(flow);
  }
}
