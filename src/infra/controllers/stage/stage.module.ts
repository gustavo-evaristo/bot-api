import { Module } from '@nestjs/common';
import { CreateStageController } from './create-stage.controller';
import { CreateStageUseCase } from 'src/domain/use-cases/stage/create-stage.use-case';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { CreateStageContentController } from './create-stage-content.controller';
import { CreateStageContentUseCase } from 'src/domain/use-cases/stage-content/create-stage.cotent.use-case';

@Module({
  controllers: [CreateStageController, CreateStageContentController],
  providers: [CreateStageUseCase, CreateStageContentUseCase],
  imports: [DatabaseModule, AuthenticationModule],
})
export class StageModule {}
