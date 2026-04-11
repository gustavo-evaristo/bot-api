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
  ) {}

  setLeaderMode(value: boolean) {
    this.leaderMode = value;
  }

  async startAllSessions(): Promise<void> {
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
  }

  async startSession(userId: string): Promise<void> {
    if (this.sessions.has(userId) || this.pendingSessions.has(userId)) {
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
        }

        if (connection === 'open') {
          const phone = sock.user?.id?.split(':')[0]?.split('@')[0];
          this.logger.log(
            `WhatsApp conectado! Número: ${phone} (userId: ${userId})`,
          );
          this.gateway.sendStatusToUser(userId, 'CONNECTED');
        }

        if (connection === 'close') {
          this.sessions.delete(userId);
          this.gateway.sendStatusToUser(userId, 'DISCONNECTED');

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
