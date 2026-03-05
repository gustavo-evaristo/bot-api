import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from './prisma.service';
import {
  IAnswerRepository,
  IKanbanRepository,
  IStageContentRepository,
  IStageRepository,
} from 'src/domain/repositories';
import { KanbanRepository } from './repositories/kanban.repository';
import { StageRepository } from './repositories/stage.repository';
import { StageContentRepository } from './repositories/stage-content.repository';
import { AnswerRepository } from './repositories/answer.repository';

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
    {
      provide: IStageRepository,
      useClass: StageRepository,
    },
    {
      provide: IStageContentRepository,
      useClass: StageContentRepository,
    },
    {
      provide: IAnswerRepository,
      useClass: AnswerRepository,
    },
  ],
  exports: [
    IUserRepository,
    IKanbanRepository,
    IStageRepository,
    IStageContentRepository,
    IAnswerRepository,
  ],
})
export class DatabaseModule {}
