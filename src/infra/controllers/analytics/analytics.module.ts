import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { WhatsappModule } from 'src/infra/whatsapp/whatsapp.module';
import { GetAnalyticsUseCase } from 'src/domain/use-cases/analytics/get-analytics.use-case';
import { GetAnalyticsV2UseCase } from 'src/domain/use-cases/analytics/get-analytics-v2.use-case';
import { GetAnalyticsController } from './get-analytics.controller';
import { GetAnalyticsV2Controller } from './get-analytics-v2.controller';

@Module({
  imports: [DatabaseModule, AuthenticationModule, WhatsappModule],
  providers: [GetAnalyticsUseCase, GetAnalyticsV2UseCase],
  controllers: [GetAnalyticsController, GetAnalyticsV2Controller],
})
export class AnalyticsModule {}
