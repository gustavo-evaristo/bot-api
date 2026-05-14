import { Module } from '@nestjs/common';
import { CreateUserController } from './create-user.controller';
import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  GetProfileUseCase,
  LoginUseCase,
  UpdateProfileUseCase,
} from 'src/domain/use-cases';
import { LoginController } from './login.controller';
import { GetProfileController } from './get-profile.controller';
import { UpdateProfileController } from './update-profile.controller';
import { ChangePasswordController } from './change-password.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';

@Module({
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
  ],
  controllers: [
    CreateUserController,
    LoginController,
    GetProfileController,
    UpdateProfileController,
    ChangePasswordController,
  ],
  imports: [DatabaseModule, AuthenticationModule],
})
export class UserModule {}
