import { UUID } from './vos';

export enum MessageSender {
  BOT = 'BOT',
  LEAD = 'LEAD',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export type MediaType = 'image';

type MessageHistoryEntityProps = {
  id?: string | UUID | null;
  conversationId: string | UUID;
  sender: MessageSender;
  content: string;
  whatsappMessageId?: string | null;
  status?: MessageStatus | null;
  statusUpdatedAt?: Date | null;
  createdAt?: Date | null;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
};

export class MessageHistoryEntity {
  id: UUID;
  conversationId: UUID;
  sender: MessageSender;
  content: string;
  whatsappMessageId: string | null;
  status: MessageStatus;
  statusUpdatedAt: Date | null;
  createdAt: Date;
  mediaUrl: string | null;
  mediaType: MediaType | null;

  constructor(props: MessageHistoryEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.conversationId instanceof UUID) {
      this.conversationId = props.conversationId;
    } else {
      this.conversationId = UUID.from(props.conversationId);
    }

    this.sender = props.sender;
    this.content = props.content;
    this.whatsappMessageId = props.whatsappMessageId ?? null;
    this.status = props.status ?? MessageStatus.SENT;
    this.statusUpdatedAt = props.statusUpdatedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.mediaUrl = props.mediaUrl ?? null;
    this.mediaType = props.mediaType ?? null;
  }
}
