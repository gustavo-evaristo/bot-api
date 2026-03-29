import { UUID } from './vos';

export enum MessageSender {
  BOT = 'BOT',
  LEAD = 'LEAD',
}

type MessageHistoryEntityProps = {
  id?: string | UUID | null;
  conversationId: string | UUID;
  sender: MessageSender;
  content: string;
  createdAt?: Date | null;
};

export class MessageHistoryEntity {
  id: UUID;
  conversationId: UUID;
  sender: MessageSender;
  content: string;
  createdAt: Date;

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
    this.createdAt = props.createdAt ?? new Date();
  }
}
