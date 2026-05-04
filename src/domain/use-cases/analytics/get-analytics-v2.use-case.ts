import { Injectable } from '@nestjs/common';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import {
  AnalyticsV2Result,
  IAnalyticsV2Repository,
  WhatsappSessionStatus,
} from 'src/domain/repositories/analytics-v2.repository';

interface Input {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  kanbanId?: string;
  flowId?: string;
}

@Injectable()
export class GetAnalyticsV2UseCase {
  constructor(
    private readonly analyticsV2Repository: IAnalyticsV2Repository,
  ) {}

  async execute({
    userId,
    startDate,
    endDate,
    kanbanId,
    flowId,
  }: Input): Promise<AnalyticsV2Result> {
    const end = endDate ? endOfDay(endDate) : endOfDay(new Date());
    const start = startDate
      ? startOfDay(startDate)
      : startOfDay(subDays(new Date(), 13));

    const result = await this.analyticsV2Repository.getAnalyticsV2(
      userId,
      start,
      end,
      kanbanId,
      flowId,
    );

    return {
      ...result,
      whatsappSessions: result.whatsappSessions.map((s) => ({
        ...s,
        status: deriveStatus(s.isActive, s.phone),
      })),
    };
  }
}

function deriveStatus(
  isActive: boolean,
  phone: string | null,
): WhatsappSessionStatus {
  // flow.isActive é mantido pelo whatsapp.service: vira true quando baileys
  // conecta com o número certo, e false quando a sessão cai. Se estiver true,
  // o fluxo está efetivamente recebendo mensagens.
  if (isActive) return 'connected';
  if (!phone) return 'pending';
  return 'disconnected';
}
