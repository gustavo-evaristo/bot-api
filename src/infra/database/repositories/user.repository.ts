import {
  FindByEmailOrPhoneInput,
  IUserRepository,
} from 'src/domain/repositories/user.repository';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password, UUID } from 'src/domain/entities/vos';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: UserEntity): Promise<void> {
    await this.prismaService.users.create({
      data: {
        id: user.id.toString(),
        isActive: user.isActive,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password.hash(),
        avatarUrl: user.avatarUrl,
        role: user.role,
        companyId: user.companyId.toString(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async update(user: UserEntity): Promise<void> {
    await this.prismaService.users.update({
      where: { id: user.id.toString() },
      data: {
        isActive: user.isActive,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password.hash(),
        avatarUrl: user.avatarUrl,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  }

  async get(id: string): Promise<UserEntity | null> {
    const user = await this.prismaService.users.findUnique({
      where: { id, isActive: true },
    });

    if (!user) {
      return null;
    }

    return new UserEntity({
      ...user,
      id: UUID.from(user.id),
      password: Password.fromHash(user.password),
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.users.findUnique({
      where: { email, isActive: true },
    });

    if (!user) {
      return null;
    }

    return new UserEntity({
      ...user,
      id: UUID.from(user.id),
      password: Password.fromHash(user.password),
    });
  }

  async findByEmailOrPhone({
    email,
    phone,
  }: FindByEmailOrPhoneInput): Promise<UserEntity | null> {
    const user = await this.prismaService.users.findFirst({
      where: {
        isActive: true,
        OR: [{ email }, { phone }],
      },
    });

    if (!user) {
      return null;
    }

    return new UserEntity({
      ...user,
      id: UUID.from(user.id),
      password: Password.fromHash(user.password),
    });
  }
}
