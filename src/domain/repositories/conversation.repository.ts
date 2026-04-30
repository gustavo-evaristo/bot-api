import { ConversationEntity } from '../entities/conversation.entity';

export interface ConversationSummary {
  id: string;
  leadPhoneNumber: string;
  leadName: string | null;
  status: string;
  automationEnabled: boolean;
  flowId: string;
  flowTitle: string;
  kanbanStageName: string | null;
  lastMessage: { content: string; sender: string; sentAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadSummary {
  id: string;
  leadPhoneNumber: string;
  leadName: string | null;
  status: string;
  flowId: string;
  flowTitle: string;
  createdAt: Date;
}

export interface ConversationDetail {
  id: string;
  flowId: string;
  leadPhoneNumber: string;
  leadName: string | null;
  status: string;
  flowTitle: string;
  flowUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class IConversationRepository {
  abstract create(conversation: ConversationEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findActive(
    flowId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null>;
  abstract update(conversation: ConversationEntity): Promise<void>;
  abstract findManyByUserId(userId: string): Promise<ConversationSummary[]>;
  abstract findById(id: string): Promise<ConversationDetail | null>;
  abstract findIdsByLeadAndKanban(
    flowId: string,
    leadPhoneNumber: string,
  ): Promise<string[]>;
  abstract findLeadsByUserId(userId: string): Promise<LeadSummary[]>;
  abstract findLastFinished(
    flowId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null>;
  abstract findByLeadPhone(
    userId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null>;
}
