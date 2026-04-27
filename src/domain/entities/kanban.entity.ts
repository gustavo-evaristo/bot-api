import { UUID } from './vos';

interface KanbanEntityProps {
  id?: string | UUID | null;
  userId: string | UUID;
  title: string;
  description?: string | null;
  isDeleted?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class KanbanEntity {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: KanbanEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.userId instanceof UUID) {
      this.userId = props.userId;
    } else {
      this.userId = UUID.from(props.userId);
    }

    this.title = props.title;
    this.description = props.description ?? null;
    this.isDeleted = props.isDeleted ?? false;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(title: string, description?: string | null) {
    this.title = title;
    this.description = description ?? null;
    this.touch();
  }

  belongsTo(userId: UUID): boolean {
    return this.userId.equals(userId);
  }

  delete() {
    this.isDeleted = true;
    this.touch();
  }
}
