import { Injectable } from '@nestjs/common';
import { QuickReplyEntity } from 'src/domain/entities/quick-reply.entity';
import { IQuickReplyRepository } from 'src/domain/repositories/quick-reply.repository';

interface Input {
  userId: string;
  shortcut: string;
  content: string;
}

@Injectable()
export class CreateQuickReplyUseCase {
  constructor(private readonly repo: IQuickReplyRepository) {}

  async execute({ userId, shortcut, content }: Input) {
    const entity = new QuickReplyEntity({ userId, shortcut, content });
    await this.repo.create(entity);
    return { id: entity.id.toString() };
  }
}
