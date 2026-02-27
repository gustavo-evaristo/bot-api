import { Module } from '@nestjs/common';
import {
  CreateUserController,
  GetProfileController,
  LoginController,
  UpdateKanbamController,
  CreateKanbamController,
} from './controllers';
import {
  CreateUserUseCase,
  LoginUseCase,
  GetProfileUseCase,
  CreateKanbamUseCase,
  UpdateKanbamUseCase,
} from 'src/domain/use-cases';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, WhatsappModule],
  controllers: [
    CreateUserController,
    LoginController,
    GetProfileController,
    CreateKanbamController,
    UpdateKanbamController,
  ],
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    GetProfileUseCase,
    CreateKanbamUseCase,
    UpdateKanbamUseCase,
  ],
})
export class InfraModule {}
