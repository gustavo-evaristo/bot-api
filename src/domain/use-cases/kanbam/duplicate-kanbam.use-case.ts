import { Injectable } from '@nestjs/common';
import { KanbamEntity } from 'src/domain/entities/kanbam.entity';
import { IKanbamRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  kanbamId: string;
  userId: string;
}

@Injectable()
export class DuplicateKanbamUseCase {
  constructor(
    private readonly kanbamRepository: IKanbamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ kanbamId, userId }: Input): Promise<KanbamEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanbam = await this.kanbamRepository.get(kanbamId);

    if (!kanbam) {
      throw new Error('Kanbam not found');
    }

    if (!kanbam.belongsTo(user.id)) {
      throw new Error('User is not the owner of the kanbam');
    }

    const duplicatedKanbam = kanbam.duplicate();

    await this.kanbamRepository.create(duplicatedKanbam);

    return kanbam;
  }
}
