import { ConflictException, Injectable } from '@nestjs/common';
import { FlowEntity } from 'src/domain/entities/flow.entity';
import { IFlowRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  title: string;
  description?: string | null;
  kanbanId?: string | null;
  phoneNumber?: string | null;
}

@Injectable()
export class CreateFlowUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({
    title,
    description,
    kanbanId,
    phoneNumber,
    userId,
  }: Input): Promise<FlowEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Restricao de produto: 1 usuario = 1 fluxo. Multiplos fluxos por user
    // exigiriam multiplas sessoes Baileys simultaneas, o que a arquitetura
    // atual (1 socket por userId) nao suporta.
    const existing = await this.flowRepository.findManyByUserId(userId);
    if (existing.length > 0) {
      throw new ConflictException(
        'Voce ja possui um fluxo. Cada conta suporta apenas um fluxo ativo.',
      );
    }

    const flow = new FlowEntity({
      userId,
      title,
      description,
      kanbanId,
      phoneNumber,
    });

    await this.flowRepository.create(flow);

    return flow;
  }
}
