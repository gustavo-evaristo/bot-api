import { ConversationEntity } from '../entities/conversation.entity';

export interface ConversationSummary {
  id: string;
  leadPhoneNumber: string;
  leadName: string | null;
  status: string;
  kanbanId: string;
  kanbanTitle: string;
  lastMessage: { content: string; sender: string; sentAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadSummary {
  id: string;
  leadPhoneNumber: string;
  leadName: string | null;
  status: string;
  kanbanId: string;
  kanbanTitle: string;
  createdAt: Date;
}

export interface ConversationDetail {
  id: string;
  kanbanId: string;
  leadPhoneNumber: string;
  leadName: string | null;
  status: string;
  kanbanTitle: string;
  kanbanUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class IConversationRepository {
  abstract create(conversation: ConversationEntity): Promise<void>;
  abstract findActive(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null>;
  abstract update(conversation: ConversationEntity): Promise<void>;
  abstract findManyByUserId(userId: string): Promise<ConversationSummary[]>;
  abstract findById(id: string): Promise<ConversationDetail | null>;
  abstract findIdsByLeadAndKanban(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<string[]>;
  abstract findLeadsByUserId(userId: string): Promise<LeadSummary[]>;
  abstract findLastFinished(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null>;
}
