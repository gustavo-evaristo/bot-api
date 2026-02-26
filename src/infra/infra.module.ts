import { Module } from '@nestjs/common';
import {
  CreateUserController,
  GetProfileController,
  LoginController,
} from './controllers';
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { DatabaseModule } from './database/database.module';
import { LoginUseCase } from 'src/domain/use-cases/login.use-case';
import { AuthenticationModule } from './authentication/authentication.module';
import { GetProfileUseCase } from 'src/domain/use-cases/get-profile.use-case';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, WhatsappModule],
  controllers: [CreateUserController, LoginController, GetProfileController],
  providers: [CreateUserUseCase, LoginUseCase, GetProfileUseCase],
})
export class InfraModule {}
