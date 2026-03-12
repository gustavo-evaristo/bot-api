import { Module } from '@nestjs/common';
import { CreateStageController } from './create-stage.controller';
import { CreateStageUseCase } from 'src/domain/use-cases/stage/create-stage.use-case';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { CreateStageContentController } from './create-stage-content.controller';
import { CreateStageContentUseCase } from 'src/domain/use-cases/stage-content/create-stage.content.use-case';
import { DeleteStageContentController } from './delete-stage-content.controller';
import {
  DeleteStageContentUseCase,
  UpdateStageContentUseCase,
} from 'src/domain/use-cases';
import { DeleteStageController } from './delete-stage.controller';
import { DeleteStageUseCase } from 'src/domain/use-cases/stage/delete-stage.use-case';
import { UpdateStageController } from './update-stage.controller';
import { UpdateStageUseCase } from 'src/domain/use-cases/stage/update-stage.use-case';
import { UpdateStageContentController } from './update-stage-content.controller';

@Module({
  controllers: [
    CreateStageController,
    CreateStageContentController,
    DeleteStageContentController,
    DeleteStageController,
    UpdateStageController,
    UpdateStageContentController,
  ],
  providers: [
    CreateStageUseCase,
    CreateStageContentUseCase,
    DeleteStageContentUseCase,
    DeleteStageUseCase,
    UpdateStageUseCase,
    UpdateStageContentUseCase,
  ],
  imports: [DatabaseModule, AuthenticationModule],
})
export class StageModule {}
