import { UUID } from './vos';

type LeadResponseEntityProps = {
  id?: string | UUID | null;
  conversationId: string | UUID;
  stageContentId: string;
  responseText: string;
  answerId?: string | null;
  score?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class LeadResponseEntity {
  id: UUID;
  conversationId: UUID;
  stageContentId: string;
  responseText: string;
  answerId: string | null;
  score: number | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: LeadResponseEntityProps) {
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

    this.stageContentId = props.stageContentId;
    this.responseText = props.responseText;
    this.answerId = props.answerId ?? null;
    this.score = props.score ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }
}
