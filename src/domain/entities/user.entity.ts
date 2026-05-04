import { Password, UUID } from './vos';

type UserEntityProps = {
  id?: UUID | string | null;
  isActive?: boolean;
  name: string;
  email: string;
  phone: string;
  password: string | Password;
  avatarUrl?: string | null;
  role?: string | null;
  companyId: UUID | string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class UserEntity {
  id: UUID;
  isActive: boolean;
  name: string;
  email: string;
  phone: string;
  password: Password;
  avatarUrl: string | null;
  role: string;
  companyId: UUID;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    this.isActive = props.isActive ?? true;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;

    if (props.password instanceof Password) {
      this.password = props.password;
    } else {
      this.password = Password.create(props.password);
    }

    this.avatarUrl = props.avatarUrl ?? null;
    this.role = props.role ?? 'ADMIN';

    if (props.companyId instanceof UUID) {
      this.companyId = props.companyId;
    } else {
      this.companyId = UUID.from(props.companyId);
    }

    const createdAt = props.createdAt || new Date();

    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  updateProfile(props: {
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string | null;
  }) {
    if (props.name !== undefined) this.name = props.name;
    if (props.email !== undefined) this.email = props.email;
    if (props.phone !== undefined) this.phone = props.phone;
    if (props.avatarUrl !== undefined) this.avatarUrl = props.avatarUrl;
    this.touch();
  }

  changePassword(newPassword: string) {
    this.password = Password.create(newPassword);
    this.touch();
  }
}
