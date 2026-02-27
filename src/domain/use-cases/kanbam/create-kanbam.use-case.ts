import { Injectable } from '@nestjs/common';
import { KanbamEntity } from 'src/domain/entities/kanbam.entity';
import { IKanbamRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  title: string;
  description: string;
}

@Injectable()
export class CreateKanbamUseCase {
  constructor(
    private readonly kanbamRepository: IKanbamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ title, description, userId }: Input): Promise<KanbamEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanbam = new KanbamEntity({
      userId,
      title,
      description,
    });

    await this.kanbamRepository.create(kanbam);

    return kanbam;
  }
}
