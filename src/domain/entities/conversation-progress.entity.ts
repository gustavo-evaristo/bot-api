import { UUID } from './vos';

type ConversationProgressEntityProps = {
  id?: string | UUID | null;
  conversationId: string | UUID;
  currentStageId: string;
  currentStageContentId: string;
  waitingForResponse?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class ConversationProgressEntity {
  id: UUID;
  conversationId: UUID;
  currentStageId: string;
  currentStageContentId: string;
  waitingForResponse: boolean;
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

    this.currentStageId = props.currentStageId;
    this.currentStageContentId = props.currentStageContentId;
    this.waitingForResponse = props.waitingForResponse ?? false;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  advanceTo(stageId: string, stageContentId: string) {
    this.currentStageId = stageId;
    this.currentStageContentId = stageContentId;
    this.waitingForResponse = false;
    this.touch();
  }

  waitForResponse() {
    this.waitingForResponse = true;
    this.touch();
  }
}
