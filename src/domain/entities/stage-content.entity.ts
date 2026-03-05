import { UUID } from './vos';

export enum ContentType {
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  FREE_INPUT = 'free_input',
}

export type IContentType = (typeof ContentType)[keyof typeof ContentType];

type StageContentEntityProps = {
  id?: string | UUID | null;
  stageId: string | UUID;
  isDeleted?: boolean;
  content: string;
  contentType: IContentType;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class StageContentEntity {
  id: UUID;
  stageId: UUID;
  isDeleted: boolean;
  content: string;
  contentType: IContentType;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: StageContentEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.stageId instanceof UUID) {
      this.stageId = props.stageId;
    } else {
      this.stageId = UUID.from(props.stageId);
    }

    this.isDeleted = props.isDeleted ?? false;
    this.content = props.content;
    this.contentType = props.contentType;

    const createdAt = props.createdAt || new Date();

    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  isMultipleChoicesContent(): boolean {
    return this.contentType === ContentType.MULTIPLE_CHOICE;
  }

  isFreeInputContent(): boolean {
    return this.contentType === ContentType.FREE_INPUT;
  }
}
