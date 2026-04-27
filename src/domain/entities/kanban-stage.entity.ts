import { UUID } from './vos';

interface KanbanStageEntityProps {
  id?: string | UUID | null;
  kanbanId: string | UUID;
  title: string;
  color?: string | null;
  order?: number | null;
  isDeleted?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class KanbanStageEntity {
  id: UUID;
  kanbanId: UUID;
  title: string;
  color: string | null;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: KanbanStageEntityProps) {
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

    this.title = props.title;
    this.color = props.color ?? null;
    this.order = props.order ?? 0;
    this.isDeleted = props.isDeleted ?? false;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(title: string, color?: string | null, order?: number) {
    this.title = title;
    this.color = color ?? this.color;
    if (order !== undefined) this.order = order;
    this.touch();
  }

  delete() {
    this.isDeleted = true;
    this.touch();
  }
}
