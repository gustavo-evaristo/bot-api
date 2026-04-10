import { UUID } from './vos';

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

type ConversationEntityProps = {
  id?: string | UUID | null;
  kanbanId: string | UUID;
  leadPhoneNumber: string;
  leadName?: string | null;
  status?: ConversationStatus | string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ConversationEntity {
  id: UUID;
  kanbanId: UUID;
  leadPhoneNumber: string;
  leadName: string | null;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ConversationEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.kanbanId instanceof UUID) {
      this.kanbanId = props.kanbanId;
    } else {
      this.kanbanId = UUID.from(props.kanbanId);
    }

    this.leadPhoneNumber = props.leadPhoneNumber;
    this.leadName = props.leadName ?? null;
    this.status =
      (props.status as ConversationStatus) ?? ConversationStatus.ACTIVE;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  finish() {
    this.status = ConversationStatus.FINISHED;
    this.touch();
  }

  isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }
}
