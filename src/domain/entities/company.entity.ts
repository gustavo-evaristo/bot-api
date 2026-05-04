import { UUID } from './vos';

interface CompanyEntityProps {
  id?: UUID | string | null;
  name: string;
  isDeleted?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class CompanyEntity {
  id: UUID;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CompanyEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    this.name = props.name;
    this.isDeleted = props.isDeleted ?? false;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  rename(name: string) {
    this.name = name;
    this.touch();
  }
}
