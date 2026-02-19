import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password, UUID } from 'src/domain/entities/vos';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: UserEntity): Promise<void> {
    const data = {
      ...user,
      id: user.id.toString(),
      password: user.password.hash(),
    };

    await this.prismaService.users.create({ data });
  }

  async get(id: string): Promise<UserEntity | null> {
    const user = await this.prismaService.users.findUnique({ where: { id } });

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
      where: { email },
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

  async findByEmailOrPhone(emailOrPhone: string): Promise<UserEntity | null> {
    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
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
