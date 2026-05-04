import { Module } from '@nestjs/common';
import { CreateUserController } from './create-user.controller';
import {
  CreateUserUseCase,
  GetProfileUseCase,
  LoginUseCase,
  UpdateProfileUseCase,
} from 'src/domain/use-cases';
import { LoginController } from './login.controller';
import { GetProfileController } from './get-profile.controller';
import { UpdateProfileController } from './update-profile.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';

@Module({
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
  ],
  controllers: [
    CreateUserController,
    LoginController,
    GetProfileController,
    UpdateProfileController,
  ],
  imports: [DatabaseModule, AuthenticationModule],
})
export class UserModule {}
