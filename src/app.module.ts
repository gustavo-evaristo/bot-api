import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [InfraModule, ConfigModule.forRoot()],
})
export class AppModule {}
