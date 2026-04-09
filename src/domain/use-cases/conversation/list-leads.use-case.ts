import { Injectable } from '@nestjs/common';
import {
  IConversationRepository,
  LeadSummary,
} from 'src/domain/repositories/conversation.repository';

interface Input {
  userId: string;
}

export interface ListLeadsOutput {
  leads: LeadSummary[];
}

@Injectable()
export class ListLeadsUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute({ userId }: Input): Promise<ListLeadsOutput> {
    const leads = await this.conversationRepository.findLeadsByUserId(userId);
    return { leads };
  }
}
