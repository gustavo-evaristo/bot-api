import { UUID } from './vos';

type WhatsAppSessionEntityProps = {
  id?: string | UUID | null;
  userId: string | UUID;
  creds?: string | null;
  keys?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class WhatsAppSessionEntity {
  id: UUID;
  userId: UUID;
  creds: string | null;
  keys: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: WhatsAppSessionEntityProps) {
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

    this.creds = props.creds ?? null;
    this.keys = props.keys ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  hasValidSession(): boolean {
    return this.creds !== null;
  }

  updateState(creds: string, keys: string | null): void {
    this.creds = creds;
    this.keys = keys;
    this.updatedAt = new Date();
  }
}
