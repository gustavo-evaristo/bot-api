import { Injectable } from '@nestjs/common';
import { IQuickReplyRepository } from 'src/domain/repositories/quick-reply.repository';

@Injectable()
export class ListQuickRepliesUseCase {
  constructor(private readonly repo: IQuickReplyRepository) {}

  async execute({ userId }: { userId: string }) {
    return this.repo.listByUserId(userId);
  }
}
