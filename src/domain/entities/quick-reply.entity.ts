import { UUID } from './vos';

type QuickReplyEntityProps = {
  id?: string | UUID | null;
  userId: string | UUID;
  shortcut: string;
  content: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class QuickReplyEntity {
  id: UUID;
  userId: UUID;
  shortcut: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: QuickReplyEntityProps) {
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

    this.shortcut = props.shortcut;
    this.content = props.content;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  update(shortcut: string, content: string) {
    this.shortcut = shortcut;
    this.content = content;
    this.touch();
  }

  belongsTo(userId: UUID): boolean {
    return this.userId.equals(userId);
  }
}
