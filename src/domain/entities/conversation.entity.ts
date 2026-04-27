import { UUID } from './vos';

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

type ConversationEntityProps = {
  id?: string | UUID | null;
  flowId: string | UUID;
  leadPhoneNumber: string;
  leadName?: string | null;
  status?: ConversationStatus | string | null;
  automationEnabled?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ConversationEntity {
  id: UUID;
  flowId: UUID;
  leadPhoneNumber: string;
  leadName: string | null;
  status: ConversationStatus;
  automationEnabled: boolean;
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

    if (props.flowId instanceof UUID) {
      this.flowId = props.flowId;
    } else {
      this.flowId = UUID.from(props.flowId);
    }

    this.leadPhoneNumber = props.leadPhoneNumber;
    this.leadName = props.leadName ?? null;
    this.status =
      (props.status as ConversationStatus) ?? ConversationStatus.ACTIVE;
    this.automationEnabled = props.automationEnabled ?? true;

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

  disableAutomation() {
    this.automationEnabled = false;
    this.touch();
  }

  enableAutomation() {
    this.automationEnabled = true;
    this.touch();
  }

  isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }
}
