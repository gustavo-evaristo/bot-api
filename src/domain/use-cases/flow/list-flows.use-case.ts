import { Injectable } from '@nestjs/common';
import {
  FlowListItem,
  IFlowRepository,
  IUserRepository,
} from 'src/domain/repositories';

@Injectable()
export class ListFlowsUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<FlowListItem[]> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.flowRepository.findManyByUserIdWithStats(userId);
  }
}
