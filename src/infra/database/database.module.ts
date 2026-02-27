import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from './prisma.service';
import { IKanbamRepository } from 'src/domain/repositories';
import { KanbamRepository } from './repositories/kanbam.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IKanbamRepository,
      useClass: KanbamRepository,
    },
  ],
  exports: [IUserRepository, IKanbamRepository],
})
export class DatabaseModule {}
