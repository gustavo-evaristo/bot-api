export type OutboundStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface PendingOutboundMessage {
  id: string;
  conversationId: string;
  userId: string;
  toPhoneNumber: string;
  content: string;
  attempts: number;
  status: OutboundStatus;
  lastError: string | null;
  nextAttemptAt: Date;
  createdAt: Date;
  sentAt: Date | null;
}

export interface EnqueueOutboundInput {
  conversationId: string;
  userId: string;
  toPhoneNumber: string;
  content: string;
  nextAttemptAt?: Date;
}

export abstract class IPendingOutboundMessageRepository {
  abstract enqueue(items: EnqueueOutboundInput[]): Promise<void>;
  abstract findReadyToSend(limit: number): Promise<PendingOutboundMessage[]>;
  abstract markSent(id: string): Promise<void>;
  abstract markFailed(
    id: string,
    error: string,
    nextAttemptAt: Date,
    attempts: number,
  ): Promise<void>;
  abstract markPermanentlyFailed(id: string, error: string): Promise<void>;
}
