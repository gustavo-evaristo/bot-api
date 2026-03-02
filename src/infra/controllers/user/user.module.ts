import { Module } from '@nestjs/common';
import { CreateUserController } from './create-user.controller';
import {
  CreateUserUseCase,
  GetProfileUseCase,
  LoginUseCase,
} from 'src/domain/use-cases';
import { LoginController } from './login.controller';
import { GetProfileController } from './get-profile.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';

@Module({
  providers: [CreateUserUseCase, LoginUseCase, GetProfileUseCase],
  controllers: [CreateUserController, LoginController, GetProfileController],
  imports: [DatabaseModule, AuthenticationModule],
})
export class UserModule {}
