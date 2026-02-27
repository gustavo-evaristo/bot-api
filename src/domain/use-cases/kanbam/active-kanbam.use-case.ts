import { Injectable } from '@nestjs/common';
import { KanbamEntity } from 'src/domain/entities/kanbam.entity';
import { IUserRepository } from 'src/domain/repositories';
import { IKanbamRepository } from 'src/domain/repositories/kanbam.repository';

interface Input {
  id: string;
  userId: string;
}

@Injectable()
export class ActiveKanbamUseCase {
  constructor(
    private readonly kanbamRepository: IKanbamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ id, userId }: Input): Promise<KanbamEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanbam = await this.kanbamRepository.get(id);

    if (!kanbam) {
      throw new Error('Kanbam not found');
    }

    if (!kanbam.belongsTo(user.id)) {
      throw new Error('User does not own this kanbam');
    }

    kanbam.active();

    await this.kanbamRepository.update(kanbam);

    return kanbam;
  }
}
