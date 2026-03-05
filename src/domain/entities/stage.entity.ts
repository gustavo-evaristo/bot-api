import { UUID } from './vos';

type StageEntityProps = {
  id?: string | UUID | null;
  kanbanId: string | UUID;
  isDeleted?: boolean;
  title: string;
  description: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class StageEntity {
  id: UUID;
  kanbanId: UUID;
  isDeleted: boolean;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: StageEntityProps) {
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

    this.isDeleted = props.isDeleted ?? false;
    this.title = props.title;
    this.description = props.description;

    const createdAt = props.createdAt || new Date();

    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }
}
