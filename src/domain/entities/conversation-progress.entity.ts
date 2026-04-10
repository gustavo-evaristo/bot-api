import { UUID } from './vos';

type ConversationProgressEntityProps = {
  id?: string | UUID | null;
  conversationId: string | UUID;
  currentNodeId: string;
  waitingForResponse?: boolean | null;
  waitingForResponseSince?: Date | null;
  followUpSentAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ConversationProgressEntity {
  id: UUID;
  conversationId: UUID;
  currentNodeId: string;
  waitingForResponse: boolean;
  waitingForResponseSince: Date | null;
  followUpSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ConversationProgressEntityProps) {
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

    this.currentNodeId = props.currentNodeId;
    this.waitingForResponse = props.waitingForResponse ?? false;
    this.waitingForResponseSince = props.waitingForResponseSince ?? null;
    this.followUpSentAt = props.followUpSentAt ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  advanceTo(nodeId: string) {
    this.currentNodeId = nodeId;
    this.waitingForResponse = false;
    this.waitingForResponseSince = null;
    this.followUpSentAt = null;
    this.touch();
  }

  waitForResponse() {
    this.waitingForResponse = true;
    this.waitingForResponseSince = new Date();
    this.touch();
  }

  markFollowUpSent() {
    this.followUpSentAt = new Date();
    this.touch();
  }
}
