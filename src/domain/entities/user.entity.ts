import { Password, UUID } from './vos';

type UserEntityProps = {
  id?: UUID | string | null;
  isActive?: boolean;
  name: string;
  email: string;
  phone: string;
  password: string | Password;
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

    const createdAt = props.createdAt || new Date();

    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }
}
