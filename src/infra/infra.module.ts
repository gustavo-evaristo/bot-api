import { Module } from '@nestjs/common';
import { CreateUserController } from './controllers';
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CreateUserController],
  providers: [CreateUserUseCase],
})
export class InfraModule {}
