import { Injectable } from '@nestjs/common';
import { IKanbamRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  kanbamId: string;
  userId: string;
}

@Injectable()
export class DeleteKanbamUseCase {
  constructor(
    private readonly kanbamRepository: IKanbamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ kanbamId, userId }: Input): Promise<void> {
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

    kanbam.delete();

    await this.kanbamRepository.update(kanbam);
  }
}
