import { UUID } from './vos';

type AnswerEntityProps = {
  id?: string | UUID | null;
  stageContentId: string | UUID;
  isDeleted?: boolean;
  content: string;
  score: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class AnswerEntity {
  id: UUID;
  stageContentId: UUID;
  isDeleted: boolean;
  content: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: AnswerEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.stageContentId instanceof UUID) {
      this.stageContentId = props.stageContentId;
    } else {
      this.stageContentId = UUID.from(props.stageContentId);
    }

    this.isDeleted = props.isDeleted ?? false;
    this.content = props.content;
    this.score = props.score ?? 0;

    const createdAt = props.createdAt || new Date();

    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }
}
