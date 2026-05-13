import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import {
  AnalyticsV2Result,
  IAnalyticsV2Repository,
} from 'src/domain/repositories/analytics-v2.repository';
import { PrismaService } from '../prisma.service';
import { startOfDay, subDays, differenceInCalendarDays } from 'date-fns';

@Injectable()
export class AnalyticsV2Repository implements IAnalyticsV2Repository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAnalyticsV2(
    userId: string,
    startDate: Date,
    endDate: Date,
    kanbanId?: string,
    flowId?: string,
  ): Promise<AnalyticsV2Result> {
    const prisma = this.prismaService;

    // Fragmento opcional aplicado em todas as queries que partem de `flows k`.
    // Se um flowId for informado, restringe TODAS as métricas àquele fluxo.
    // Pipeline kanban filtra via `c."flowId"` (conversations).
    const flowFilterK = flowId
      ? Prisma.sql`AND k.id = ${flowId}`
      : Prisma.empty;
    const flowFilterC = flowId
      ? Prisma.sql`AND c."flowId" = ${flowId}`
      : Prisma.empty;

    type BigIntRow = { count: bigint };

    // KPIs "hoje" — usando fuso de Brasília (UTC-3, sem horário de verão)
    const [todayMsgsRow] = await prisma.$queryRaw<BigIntRow[]>`
      SELECT COUNT(mh.id)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      JOIN message_history mh ON mh."conversationId" = c.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND mh.sender = 'LEAD'
        AND mh."createdAt" >= DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
    `;

    const [todayLeadsRow] = await prisma.$queryRaw<BigIntRow[]>`
      SELECT COUNT(c.id)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" >= DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
    `;

    // Active conversations + pending responses
    const [activeRow] = await prisma.$queryRaw<BigIntRow[]>`
      SELECT COUNT(c.id)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."isDeleted" = false
        AND c.status = 'ACTIVE'
    `;

    const [pendingRow] = await prisma.$queryRaw<BigIntRow[]>`
      SELECT COUNT(c.id)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      JOIN conversation_progress cp ON cp."conversationId" = c.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."isDeleted" = false
        AND c.status = 'ACTIVE'
        AND cp."waitingForResponse" = true
    `;

    // Completion rate (período)
    type RateRow = { total: bigint; completed: bigint };
    const [completionRow] = await prisma.$queryRaw<RateRow[]>`
      SELECT
        COUNT(c.id)::bigint AS total,
        COUNT(c.id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM conversation_progress cp
            JOIN flow_nodes fn ON fn.id = cp."currentNodeId"
            WHERE cp."conversationId" = c.id AND fn.type = 'END'
          )
        )::bigint AS completed
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${startDate} AND ${endDate}
    `;
    const totalForRate = Number(completionRow?.total ?? 0n);
    const completedForRate = Number(completionRow?.completed ?? 0n);
    const completionRate =
      totalForRate > 0
        ? Math.round((completedForRate / totalForRate) * 100)
        : 0;

    // Live activity — últimas 10 lead_responses do usuário
    type ActivityRow = {
      leadName: string | null;
      leadPhone: string;
      content: string;
      nodeType: string | null;
      stageId: string | null;
      stageName: string | null;
      stageColor: string | null;
      createdAt: Date;
    };
    const liveActivityRows = await prisma.$queryRaw<ActivityRow[]>`
      SELECT
        c."leadName" AS "leadName",
        c."leadPhoneNumber" AS "leadPhone",
        lr."responseText" AS "content",
        fn.type AS "nodeType",
        ks.id AS "stageId",
        ks.title AS "stageName",
        ks.color AS "stageColor",
        lr."createdAt" AS "createdAt"
      FROM lead_responses lr
      JOIN conversations c ON c.id = lr."conversationId"
      JOIN flows k ON k.id = c."flowId"
      LEFT JOIN flow_nodes fn ON fn.id = lr."nodeId"
      LEFT JOIN kanban_stages ks ON ks.id = fn."postFillKanbanStageId"
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
      ORDER BY lr."createdAt" DESC
      LIMIT 10
    `;

    // WhatsApp sessions por fluxo. Carrega o flag isActive — fonte de verdade
    // mantida pelo whatsapp.service: ativa em connection.update 'open' e
    // desativa em 'close'. O use-case usa isso pra derivar o status final.
    type FlowSessionRow = {
      flowId: string;
      flowName: string;
      phone: string | null;
      isActive: boolean;
    };
    const whatsappSessionRows = await prisma.$queryRaw<FlowSessionRow[]>`
      SELECT
        k.id AS "flowId",
        k.title AS "flowName",
        k."phoneNumber" AS phone,
        k."isActive" AS "isActive"
      FROM flows k
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
      ORDER BY k."createdAt" DESC
      LIMIT 6
    `;

    // Sparkline: leads por dia últimos 14 dias (independente do filtro de período)
    const sparkStart = startOfDay(subDays(new Date(), 13));
    const sparkEnd = endDate;
    type DayRow = { day: Date; count: bigint };
    const sparkRows = await prisma.$queryRaw<DayRow[]>`
      SELECT
        DATE_TRUNC('day', c."createdAt") AS day,
        COUNT(*)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${sparkStart} AND ${sparkEnd}
      GROUP BY day
      ORDER BY day
    `;
    const leadsByDay: number[] = Array(14).fill(0);
    for (const row of sparkRows) {
      const idx = differenceInCalendarDays(row.day, sparkStart);
      if (idx >= 0 && idx < 14) leadsByDay[idx] = Number(row.count);
    }
    const leadsByDayTotal = leadsByDay.reduce((a, b) => a + b, 0);
    const prevStart = startOfDay(subDays(sparkStart, 14));
    const prevEnd = subDays(sparkStart, 1);
    const [prevTotalRow] = await prisma.$queryRaw<BigIntRow[]>`
      SELECT COUNT(c.id)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${prevStart} AND ${prevEnd}
    `;
    const prevTotal = Number(prevTotalRow?.count ?? 0n);
    const leadsByDayDelta =
      prevTotal > 0
        ? Math.round(((leadsByDayTotal - prevTotal) / prevTotal) * 100)
        : leadsByDayTotal > 0
          ? 100
          : 0;

    // Pipeline (kanban)
    type KanbanRow = { id: string; title: string };
    let pipelineKanban: KanbanRow | undefined;
    if (kanbanId) {
      const [row] = await prisma.$queryRaw<KanbanRow[]>`
        SELECT id, title FROM kanbans
        WHERE id = ${kanbanId} AND "userId" = ${userId} AND "isDeleted" = false
        LIMIT 1
      `;
      pipelineKanban = row;
    } else {
      const [row] = await prisma.$queryRaw<KanbanRow[]>`
        SELECT id, title FROM kanbans
        WHERE "userId" = ${userId} AND "isDeleted" = false
        ORDER BY "createdAt" ASC
        LIMIT 1
      `;
      pipelineKanban = row;
    }

    type PipelineStageRow = {
      id: string;
      title: string;
      color: string | null;
      order: number;
      count: bigint;
    };
    let pipelineStageRows: PipelineStageRow[] = [];
    if (pipelineKanban) {
      pipelineStageRows = await prisma.$queryRaw<PipelineStageRow[]>`
        SELECT
          ks.id,
          ks.title,
          ks.color,
          ks."order" AS "order",
          COUNT(cp.id)::bigint AS count
        FROM kanban_stages ks
        LEFT JOIN conversation_progress cp ON cp."lastKanbanStageId" = ks.id
        LEFT JOIN conversations c
          ON c.id = cp."conversationId"
          AND c."isDeleted" = false
          ${flowFilterC}
        WHERE ks."kanbanId" = ${pipelineKanban.id}
          AND ks."isDeleted" = false
        GROUP BY ks.id, ks.title, ks.color, ks."order"
        ORDER BY ks."order" ASC
      `;
    }

    // Mensagens por hora (24)
    type HourRow = { hour: number; count: bigint };
    const hourRows = await prisma.$queryRaw<HourRow[]>`
      SELECT
        EXTRACT(HOUR FROM mh."createdAt")::int AS hour,
        COUNT(*)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      JOIN message_history mh ON mh."conversationId" = c.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND mh."createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY hour
      ORDER BY hour
    `;
    const messagesByHour: number[] = Array(24).fill(0);
    for (const row of hourRows) {
      if (row.hour >= 0 && row.hour < 24)
        messagesByHour[row.hour] = Number(row.count);
    }

    // Leads por data (período)
    type DateRow = { date: string; count: bigint };
    const leadsByDateRows = await prisma.$queryRaw<DateRow[]>`
      SELECT
        TO_CHAR(c."createdAt", 'DD/MM') AS date,
        COUNT(*)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY TO_CHAR(c."createdAt", 'DD/MM'), DATE_TRUNC('day', c."createdAt")
      ORDER BY DATE_TRUNC('day', c."createdAt")
    `;

    const messagesByDateRows = await prisma.$queryRaw<DateRow[]>`
      SELECT
        TO_CHAR(mh."createdAt", 'DD/MM') AS date,
        COUNT(*)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      JOIN message_history mh ON mh."conversationId" = c.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND mh."createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY TO_CHAR(mh."createdAt", 'DD/MM'), DATE_TRUNC('day', mh."createdAt")
      ORDER BY DATE_TRUNC('day', mh."createdAt")
    `;

    // Completion rate por dia
    type RateDateRow = { date: string; total: bigint; completed: bigint };
    const completionByDateRows = await prisma.$queryRaw<RateDateRow[]>`
      SELECT
        TO_CHAR(c."createdAt", 'DD/MM') AS date,
        COUNT(c.id)::bigint AS total,
        COUNT(c.id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM conversation_progress cp
            JOIN flow_nodes fn ON fn.id = cp."currentNodeId"
            WHERE cp."conversationId" = c.id AND fn.type = 'END'
          )
        )::bigint AS completed
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY TO_CHAR(c."createdAt", 'DD/MM'), DATE_TRUNC('day', c."createdAt")
      ORDER BY DATE_TRUNC('day', c."createdAt")
    `;

    // Status donut (período)
    type StatusRow = { status: string; count: bigint };
    const statusRows = await prisma.$queryRaw<StatusRow[]>`
      SELECT c.status, COUNT(*)::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY c.status
    `;
    let statusActive = 0;
    let statusCompleted = 0;
    let statusAbandoned = 0;
    for (const row of statusRows) {
      const n = Number(row.count);
      const s = (row.status || '').toUpperCase();
      if (s === 'ACTIVE') statusActive += n;
      else if (s === 'FINISHED' || s === 'COMPLETED') statusCompleted += n;
      else if (s === 'ABANDONED') statusAbandoned += n;
    }

    // Performance por fluxo
    type FlowPerfRow = { flowId: string; name: string; leads: bigint };
    const flowRows = await prisma.$queryRaw<FlowPerfRow[]>`
      SELECT k.id AS "flowId", k.title AS name, COUNT(c.id)::bigint AS leads
      FROM flows k
      LEFT JOIN conversations c
        ON c."flowId" = k.id
        AND c."createdAt" BETWEEN ${startDate} AND ${endDate}
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
      GROUP BY k.id, k.title
      ORDER BY leads DESC
    `;
    const flowsTotal = flowRows.reduce((acc, r) => acc + Number(r.leads), 0);
    const performanceByFlow = flowRows.map((r) => {
      const leads = Number(r.leads);
      return {
        flowId: r.flowId,
        name: r.name,
        leads,
        percentage: flowsTotal > 0 ? Math.round((leads / flowsTotal) * 100) : 0,
      };
    });

    // Tempo médio de resposta (BOT após LEAD)
    type AvgRow = { seconds: number | null };
    const [avgRow] = await prisma.$queryRaw<AvgRow[]>`
      WITH paired AS (
        SELECT
          mh.id,
          mh."conversationId",
          mh.sender,
          mh."createdAt",
          LEAD(mh."createdAt") OVER (
            PARTITION BY mh."conversationId" ORDER BY mh."createdAt"
          ) AS next_at,
          LEAD(mh.sender) OVER (
            PARTITION BY mh."conversationId" ORDER BY mh."createdAt"
          ) AS next_sender
        FROM message_history mh
        JOIN conversations c ON c.id = mh."conversationId"
        JOIN flows k ON k.id = c."flowId"
        WHERE k."userId" = ${userId} ${flowFilterK}
          AND k."isDeleted" = false
          AND mh."createdAt" BETWEEN ${startDate} AND ${endDate}
      )
      SELECT
        AVG(EXTRACT(EPOCH FROM (next_at - "createdAt")))::float AS seconds
      FROM paired
      WHERE sender = 'LEAD' AND next_sender = 'BOT'
    `;
    const avgSeconds = Math.round(avgRow?.seconds ?? 0);
    const averageResponseTime = formatSeconds(avgSeconds);

    // Unique leads
    const [uniqueLeadsRow] = await prisma.$queryRaw<BigIntRow[]>`
      SELECT COUNT(DISTINCT c."leadPhoneNumber")::bigint AS count
      FROM flows k
      JOIN conversations c ON c."flowId" = k.id
      WHERE k."userId" = ${userId} ${flowFilterK}
        AND k."isDeleted" = false
        AND c."createdAt" BETWEEN ${startDate} AND ${endDate}
    `;

    return {
      messagesReceivedToday: Number(todayMsgsRow?.count ?? 0n),
      newLeadsToday: Number(todayLeadsRow?.count ?? 0n),
      activeConversations: Number(activeRow?.count ?? 0n),
      pendingResponses: Number(pendingRow?.count ?? 0n),
      completionRate,

      liveActivity: liveActivityRows.map((r) => ({
        who: r.leadName?.trim() || formatPhone(r.leadPhone),
        action: actionFromNodeType(r.nodeType),
        stageId: r.stageId,
        stageName: r.stageName,
        stageColor: r.stageColor,
        timestamp: r.createdAt,
      })),

      // Status preenchido pelo use-case usando flow.isActive como fonte de verdade.
      whatsappSessions: whatsappSessionRows.map((r) => ({
        flowId: r.flowId,
        flowName: r.flowName,
        phone: r.phone,
        isActive: r.isActive,
        status: 'pending' as const,
      })),

      leadsByDay,
      leadsByDayTotal,
      leadsByDayDelta,

      pipelineKanbanId: pipelineKanban?.id ?? null,
      pipelineKanbanTitle: pipelineKanban?.title ?? null,
      pipelineStages: pipelineStageRows.map((r) => ({
        id: r.id,
        title: r.title,
        color: r.color,
        order: r.order,
        count: Number(r.count),
      })),

      messagesByHour,
      leadsByDateDetailed: leadsByDateRows.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      messagesByDateDetailed: messagesByDateRows.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      completionRateByDate: completionByDateRows.map((r) => {
        const total = Number(r.total);
        const completed = Number(r.completed);
        return {
          date: r.date,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }),

      conversationStatusCounts: {
        active: statusActive,
        completed: statusCompleted,
        abandoned: statusAbandoned,
      },

      performanceByFlow,

      averageResponseTime,
      uniqueLeads: Number(uniqueLeadsRow?.count ?? 0n),
      // Sem fonte real ainda — UI esconde o card quando null.
      costPerLead: null,
    };
  }
}

function actionFromNodeType(type: string | null): string {
  switch (type) {
    case 'QUESTION_MULTIPLE_CHOICE':
      return 'respondeu múltipla escolha';
    case 'QUESTION_FREE_INPUT':
      return 'respondeu';
    case 'FORM':
      return 'preencheu formulário';
    case 'END':
      return 'finalizou conversa';
    case 'TEXT':
      return 'interagiu';
    default:
      return 'respondeu';
  }
}

function formatSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function formatPhone(raw: string): string {
  return raw?.replace(/\D/g, '').slice(-4)
    ? `Lead ****${raw.replace(/\D/g, '').slice(-4)}`
    : 'Lead';
}
