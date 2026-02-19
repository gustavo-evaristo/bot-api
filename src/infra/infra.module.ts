import { Module } from '@nestjs/common';
import { CreateUserController, LoginController } from './controllers';
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { DatabaseModule } from './database/database.module';
import { LoginUseCase } from 'src/domain/use-cases/login.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CreateUserController, LoginController],
  providers: [CreateUserUseCase, LoginUseCase],
})
export class InfraModule {}
