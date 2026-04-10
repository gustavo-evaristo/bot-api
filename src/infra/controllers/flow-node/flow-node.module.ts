import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { CreateNodeController } from './create-node.controller';
import { UpdateNodeController } from './update-node.controller';
import { DeleteNodeController } from './delete-node.controller';
import { CreateNodeUseCase } from 'src/domain/use-cases/flow-node/create-node.use-case';
import { UpdateNodeUseCase } from 'src/domain/use-cases/flow-node/update-node.use-case';
import { DeleteNodeUseCase } from 'src/domain/use-cases/flow-node/delete-node.use-case';

@Module({
  controllers: [
    CreateNodeController,
    UpdateNodeController,
    DeleteNodeController,
  ],
  providers: [CreateNodeUseCase, UpdateNodeUseCase, DeleteNodeUseCase],
  imports: [DatabaseModule, AuthenticationModule],
})
export class FlowNodeModule {}
