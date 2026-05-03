import { Injectable, Logger } from '@nestjs/common';
import type { WASocket } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import {
  MessageHistoryEntity,
  MessageSender,
} from 'src/domain/entities/message-history.entity';
import { UUID } from 'src/domain/entities/vos';
import { IWhatsAppSessionRepository } from 'src/domain/repositories/whatsapp-session.repository';
import { IFlowRepository } from 'src/domain/repositories/flow.repository';
import { loadBaileys } from './baileys.loader';
import { useWhatsAppAuthState } from './whatsapp-auth-state';

const RECONNECT_BATCH_SIZE = 10;

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private sessions = new Map<string, WASocket>();
  private pendingSessions = new Set<string>();
  private stores = new Map<string, any>();
  private leaderMode = false;

  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly processMessageUseCase: ProcessMessageUseCase,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly flowRepository: IFlowRepository,
  ) {}

  setLeaderMode(value: boolean) {
    this.leaderMode = value;
  }

  async startAllSessions(): Promise<void> {
    // Reset all rows to DISCONNECTED before opening sockets. If a previous
    // leader died without stepping down, its CONNECTED row would otherwise
    // mislead the dashboard until the next event.
    await this.sessionRepository
      .markAllDisconnected()
      .catch((err) =>
        this.logger.error('Falha ao resetar status de sessões:', err),
      );

    const userIds = await this.sessionRepository.findAllUserIds();
    if (userIds.length === 0) return;

    this.logger.log(`Restaurando ${userIds.length} sessão(ões) WhatsApp...`);

    for (let i = 0; i < userIds.length; i += RECONNECT_BATCH_SIZE) {
      const batch = userIds.slice(i, i + RECONNECT_BATCH_SIZE);
      await Promise.all(
        batch.map((userId) =>
          this.startSession(userId).catch((err) =>
            this.logger.error(`Erro ao restaurar sessão ${userId}:`, err),
          ),
        ),
      );
    }
  }

  async stopAllSessions(): Promise<void> {
    for (const [, sock] of this.sessions) {
      try {
        (sock as any).end?.();
      } catch {}
    }
    this.sessions.clear();
    this.stores.clear();
    this.pendingSessions.clear();
    // After stepping down we no longer hold any socket. Mark all rows as
    // DISCONNECTED so the new leader (or readers) see consistent state.
    await this.sessionRepository
      .markAllDisconnected()
      .catch((err) =>
        this.logger.error('Falha ao resetar status no shutdown:', err),
      );
  }

  async startSession(
    userId: string,
    targetPhoneNumber?: string | null,
  ): Promise<void> {
    const existingSock = this.sessions.get(userId);
    if (existingSock) {
      const rawCurrent = existingSock.user?.id?.split(':')[0]?.split('@')[0];
      const currentPhone = rawCurrent
        ? this.normalizeBrazilianPhone('+' + rawCurrent)
        : null;
      const desiredPhone = targetPhoneNumber
        ? this.normalizeBrazilianPhone(targetPhoneNumber)
        : null;

      if (desiredPhone && currentPhone && currentPhone === desiredPhone) {
        // Sessão já está pareada com o número desejado — re-emite CONNECTED
        // pra UI que acabou de abrir um novo socket, e ativa fluxo pendente.
        this.gateway.sendStatusToUser(userId, 'CONNECTED');
        await this.flowRepository
          .activatePendingByUserAndPhone(userId, currentPhone)
          .catch((err) =>
            this.logger.error(
              `Falha ao ativar fluxo pendente (sessão existente) para ${userId}:`,
              err,
            ),
          );
        return;
      }

      if (desiredPhone && currentPhone && currentPhone !== desiredPhone) {
        // Pareado com OUTRO número — desloga e segue pra parear o novo.
        this.logger.log(
          `Trocando número WhatsApp para ${userId}: ${currentPhone} → ${desiredPhone}.`,
        );
        await this.forceResetSession(userId, existingSock);
      } else {
        // Sem alvo informado: mantém o que está e re-emite status.
        if (currentPhone) {
          this.gateway.sendStatusToUser(userId, 'CONNECTED');
        }
        return;
      }
    }

    if (this.pendingSessions.has(userId)) {
      return;
    }

    this.pendingSessions.add(userId);

    let DisconnectReason: any;
    let saveCreds: () => Promise<void>;
    let lidToPhone: Map<string, string>;
    let sock: WASocket;

    try {
      const baileys = await loadBaileys();
      DisconnectReason = baileys.DisconnectReason;

      const authState = await useWhatsAppAuthState(
        userId,
        this.sessionRepository,
      );
      saveCreds = authState.saveCreds;

      const { version } = await baileys.fetchLatestBaileysVersion();

      lidToPhone = new Map<string, string>();
      this.stores.set(userId, lidToPhone);

      const noopLogger = {
        level: 'silent',
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        fatal: () => {},
        child: () => noopLogger,
      };

      sock = baileys.makeWASocket({
        version,
        auth: authState.state,
        printQRInTerminal: false,
        logger: noopLogger as any,
      });

      this.sessions.set(userId, sock);
    } catch (err) {
      this.pendingSessions.delete(userId);
      throw err;
    }

    this.pendingSessions.delete(userId);

    sock.ev.on('creds.update', saveCreds);

    const syncContacts = (contacts: { id: string; lid?: string }[]) => {
      for (const contact of contacts) {
        if (contact.lid && contact.id.endsWith('@s.whatsapp.net')) {
          lidToPhone.set(contact.lid, contact.id);
        }
      }
    };
    sock.ev.on('contacts.upsert', syncContacts);
    sock.ev.on('contacts.update', syncContacts as any);

    sock.ev.on(
      'connection.update',
      async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
          const qrImage = await QRCode.toDataURL(qr);
          this.gateway.sendQrToUser(userId, qrImage);
          await this.sessionRepository
            .setConnectionStatus(userId, 'PENDING', null)
            .catch((err) =>
              this.logger.error(
                `Falha ao persistir status PENDING para ${userId}:`,
                err,
              ),
            );
        }

        if (connection === 'open') {
          const rawPhone = sock.user?.id?.split(':')[0]?.split('@')[0];
          const phone = rawPhone
            ? this.normalizeBrazilianPhone('+' + rawPhone)
            : null;
          this.logger.log(
            `WhatsApp conectado! Número: ${phone} (userId: ${userId})`,
          );
          this.gateway.sendStatusToUser(userId, 'CONNECTED');
          await this.sessionRepository
            .setConnectionStatus(userId, 'CONNECTED', phone)
            .catch((err) =>
              this.logger.error(
                `Falha ao persistir status CONNECTED para ${userId}:`,
                err,
              ),
            );
          if (phone) {
            await this.flowRepository
              .activatePendingByUserAndPhone(userId, phone)
              .then((count) => {
                if (count > 0) {
                  this.logger.log(
                    `${count} fluxo(s) ativado(s) para ${userId} no número ${phone}.`,
                  );
                }
              })
              .catch((err) =>
                this.logger.error(
                  `Falha ao ativar fluxo pendente para ${userId}:`,
                  err,
                ),
              );
          }
        }

        if (connection === 'close') {
          // Se este socket já foi substituído por outro (ex.: forceResetSession
          // que troca o número pareado), ignora pra não derrubar a nova sessão.
          if (this.sessions.get(userId) !== sock) {
            return;
          }
          this.sessions.delete(userId);
          this.gateway.sendStatusToUser(userId, 'DISCONNECTED');
          await this.sessionRepository
            .setConnectionStatus(userId, 'DISCONNECTED', null)
            .catch((err) =>
              this.logger.error(
                `Falha ao persistir status DISCONNECTED para ${userId}:`,
                err,
              ),
            );

          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const loggedOut = statusCode === DisconnectReason.loggedOut;

          if (loggedOut) {
            this.logger.log(
              `Sessão deslogada para ${userId}. Removendo sessão.`,
            );
            await this.sessionRepository.delete(userId);
            this.stores.delete(userId);
          } else if (this.leaderMode) {
            // Código 440 = Connection Replaced (outra instância tomou a sessão).
            // Aguarda antes de reconectar para evitar loop de kick mútuo.
            const delay =
              statusCode === DisconnectReason.connectionReplaced
                ? 10_000
                : 2_000;
            this.logger.log(
              `Conexão encerrada para ${userId} (código ${statusCode}). Reconectando em ${delay / 1000}s...`,
            );
            setTimeout(() => {
              this.startSession(userId).catch((err) =>
                this.logger.error(`Erro ao reconectar ${userId}:`, err),
              );
            }, delay);
          } else {
            this.logger.log(
              `Conexão encerrada para ${userId} (código ${statusCode}). Não reconectando (modo standby).`,
            );
          }
        }
      },
    );

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const message of messages) {
        await this.handleIncomingMessage(
          userId,
          sock,
          message,
          lidToPhone,
        ).catch((err) => this.logger.error(`Erro ao processar mensagem:`, err));
      }
    });
  }

  private async forceResetSession(
    userId: string,
    sock: WASocket,
  ): Promise<void> {
    // Tira do mapa ANTES do logout pra que o handler de close (que checa
    // identidade) trate isso como sessão antiga e não dispare reconexão.
    this.sessions.delete(userId);
    this.stores.delete(userId);

    try {
      await (sock as any).logout?.();
    } catch (err) {
      this.logger.warn(`Falha no logout WhatsApp de ${userId}:`, err);
      try {
        (sock as any).end?.(undefined);
      } catch {}
    }

    await this.sessionRepository
      .delete(userId)
      .catch((err) =>
        this.logger.error(`Falha ao remover sessão ${userId}:`, err),
      );
  }

  async sendMessage(
    userId: string,
    leadPhoneNumber: string,
    content: string,
    conversationId: string,
  ): Promise<void> {
    const sock = this.sessions.get(userId);
    if (!sock) {
      throw new Error(
        'Sessão WhatsApp não está ativa. Conecte-se antes de enviar mensagens.',
      );
    }

    const jid = leadPhoneNumber.replace('+', '') + '@s.whatsapp.net';
    await sock.sendMessage(jid, { text: content });

    this.gateway.sendNewMessage(userId, {
      conversationId,
      sender: 'BOT',
      content,
      createdAt: new Date(),
    });
  }

  private normalizeBrazilianPhone(phone: string): string {
    const digits = phone.replace('+', '');
    // Número brasileiro sem o 9 extra: +55 + 2 dígitos DDD + 8 dígitos = 12 dígitos
    // Formato correto (celular):         +55 + 2 dígitos DDD + 9 dígitos = 13 dígitos
    if (digits.startsWith('55') && digits.length === 12) {
      return '+' + digits.slice(0, 4) + '9' + digits.slice(4);
    }
    return phone;
  }

  private async handleIncomingMessage(
    userId: string,
    sock: WASocket,
    message: any,
    lidToPhone: Map<string, string>,
  ) {
    const jid = message.key?.remoteJid;
    if (
      !jid ||
      jid.endsWith('@g.us') ||
      jid.endsWith('@broadcast') ||
      jid.endsWith('@newsletter')
    )
      return;
    if (message.key?.fromMe) return;

    const messageText =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      null;

    if (!messageText || messageText.trim() === '') return;

    // Resolve phone number: @lid JIDs use an internal ID, not the real phone.
    // Baileys provides the real JID in key.remoteJidAlt when addressingMode === "lid".
    // Fall back to the contacts map built during sync, then to the raw JID.
    let phoneJid = jid;
    if (jid.endsWith('@lid')) {
      phoneJid = message.key?.remoteJidAlt ?? lidToPhone.get(jid) ?? jid;
    }
    const rawNumber = phoneJid.split('@')[0];
    if (!rawNumber || !/^\d+$/.test(rawNumber)) return;
    const leadPhoneNumber = this.normalizeBrazilianPhone('+' + rawNumber);
    const botPhoneNumber = sock.user?.id
      ? this.normalizeBrazilianPhone(
          '+' + sock.user.id.split(':')[0].split('@')[0],
        )
      : '';
    const leadName = message.pushName || null;

    this.logger.log(
      `Mensagem recebida — bot: ${botPhoneNumber} | lead: ${leadPhoneNumber} | texto: "${messageText}"`,
    );

    const {
      conversationId,
      userId: resolvedUserId,
      messagesToSend,
    } = await this.processMessageUseCase.execute({
      botPhoneNumber,
      leadPhoneNumber,
      messageText,
      leadName,
    });

    if (!resolvedUserId) {
      this.logger.warn(
        `Nenhum flow ativo para o número ${botPhoneNumber}. Mensagem de ${leadPhoneNumber} ignorada.`,
      );
      return;
    }

    if (conversationId && resolvedUserId) {
      await this.messageHistoryRepository.create(
        new MessageHistoryEntity({
          conversationId: UUID.from(conversationId),
          sender: MessageSender.LEAD,
          content: messageText,
        }),
      );

      this.gateway.sendNewMessage(resolvedUserId, {
        conversationId,
        sender: 'LEAD',
        content: messageText,
        createdAt: new Date(),
      });
    }

    for (const text of messagesToSend) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await sock.sendMessage(jid, { text });

      if (conversationId && resolvedUserId) {
        await this.messageHistoryRepository.create(
          new MessageHistoryEntity({
            conversationId: UUID.from(conversationId),
            sender: MessageSender.BOT,
            content: text,
          }),
        );

        this.gateway.sendNewMessage(resolvedUserId, {
          conversationId,
          sender: 'BOT',
          content: text,
          createdAt: new Date(),
        });
      }
    }
  }
}
