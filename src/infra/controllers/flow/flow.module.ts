import { Module } from '@nestjs/common';
import { ListFlowsController } from './list-flows.controller';
import { GetFlowController } from './get-flow.controller';
import { UpdateFlowController } from './update-flow.controller';
import {
  ActiveFlowUseCase,
  CreateFlowUseCase,
  DeleteFlowUseCase,
  DesactiveFlowUseCase,
  GetFlowUseCase,
  ListFlowsUseCase,
  SetFlowStartNodeUseCase,
  UpdateFlowPhoneNumberUseCase,
  UpdateFlowUseCase,
} from 'src/domain/use-cases';
import { CreateFlowController } from './create-flow.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { ActiveFlowController } from './active-flow.controller';
import { DesactiveFlowController } from './desactive-flow.controller';
import { UpdateFlowPhoneNumberController } from './update-flow-phone-number.controller';
import { SetFlowStartNodeController } from './set-flow-start-node.controller';
import { DeleteFlowController } from './delete-flow.controller';

@Module({
  providers: [
    UpdateFlowUseCase,
    ListFlowsUseCase,
    GetFlowUseCase,
    CreateFlowUseCase,
    ActiveFlowUseCase,
    DesactiveFlowUseCase,
    UpdateFlowPhoneNumberUseCase,
    SetFlowStartNodeUseCase,
    DeleteFlowUseCase,
  ],
  controllers: [
    CreateFlowController,
    ListFlowsController,
    GetFlowController,
    UpdateFlowController,
    ActiveFlowController,
    DesactiveFlowController,
    UpdateFlowPhoneNumberController,
    SetFlowStartNodeController,
    DeleteFlowController,
  ],
  imports: [DatabaseModule, AuthenticationModule],
})
export class FlowModule {}
