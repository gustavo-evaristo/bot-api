import { Injectable } from '@nestjs/common';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import {
  AnalyticsV2Result,
  IAnalyticsV2Repository,
  WhatsappSessionStatus,
} from 'src/domain/repositories/analytics-v2.repository';
import { IWhatsappStatusRepository } from 'src/domain/repositories/whatsapp-status.repository';

interface Input {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  kanbanId?: string;
}

@Injectable()
export class GetAnalyticsV2UseCase {
  constructor(
    private readonly analyticsV2Repository: IAnalyticsV2Repository,
    private readonly whatsappStatusRepository: IWhatsappStatusRepository,
  ) {}

  async execute({
    userId,
    startDate,
    endDate,
    kanbanId,
  }: Input): Promise<AnalyticsV2Result> {
    const end = endDate ? endOfDay(endDate) : endOfDay(new Date());
    const start = startDate
      ? startOfDay(startDate)
      : startOfDay(subDays(new Date(), 13));

    const [result, connectedPhone] = await Promise.all([
      this.analyticsV2Repository.getAnalyticsV2(userId, start, end, kanbanId),
      this.whatsappStatusRepository.getConnectedPhone(userId),
    ]);

    const normalize = (p: string | null | undefined) =>
      (p || '').replace(/\D/g, '');
    const connectedDigits = normalize(connectedPhone);

    return {
      ...result,
      whatsappSessions: result.whatsappSessions.map((s) => ({
        ...s,
        status: deriveStatus(normalize(s.phone), connectedDigits),
      })),
    };
  }
}

function deriveStatus(
  flowDigits: string,
  connectedDigits: string,
): WhatsappSessionStatus {
  if (!flowDigits) return 'pending';
  if (!connectedDigits) return 'disconnected';
  return flowDigits === connectedDigits ? 'connected' : 'disconnected';
}
