import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { GetAnalyticsUseCase } from 'src/domain/use-cases/analytics/get-analytics.use-case';
import { GetAnalyticsController } from './get-analytics.controller';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [GetAnalyticsUseCase],
  controllers: [GetAnalyticsController],
})
export class AnalyticsModule {}
