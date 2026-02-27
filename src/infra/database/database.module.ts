import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from './prisma.service';
import { IKanbanRepository } from 'src/domain/repositories';
import { KanbanRepository } from './repositories/kanban.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IKanbanRepository,
      useClass: KanbanRepository,
    },
  ],
  exports: [IUserRepository, IKanbanRepository],
})
export class DatabaseModule {}
