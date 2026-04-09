import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { WASocket } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageHistoryEntity, MessageSender } from 'src/domain/entities/message-history.entity';
import { UUID } from 'src/domain/entities/vos';
import { IWhatsAppSessionRepository } from 'src/domain/repositories/whatsapp-session.repository';
import { loadBaileys } from './baileys.loader';
import { useWhatsAppAuthState } from './whatsapp-auth-state';

const RECONNECT_BATCH_SIZE = 10;

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private sessions = new Map<string, WASocket>();

  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly processMessageUseCase: ProcessMessageUseCase,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
    private readonly sessionRepository: IWhatsAppSessionRepository,
  ) {}

  async onModuleInit() {
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

  async startSession(userId: string): Promise<void> {
    if (this.sessions.has(userId)) {
      this.logger.log(`Sessão já existe para ${userId}`);
      return;
    }

    const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = await loadBaileys();
    const { state, saveCreds } = await useWhatsAppAuthState(userId, this.sessionRepository);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: { level: 'silent' } as any,
    });

    this.sessions.set(userId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        const qrImage = await QRCode.toDataURL(qr);
        this.gateway.sendQrToUser(userId, qrImage);
      }

      if (connection === 'open') {
        const phone = sock.user?.id?.split(':')[0]?.split('@')[0];
        this.logger.log(`WhatsApp conectado! Número: ${phone} (userId: ${userId})`);
        this.gateway.sendStatusToUser(userId, 'CONNECTED');
      }

      if (connection === 'close') {
        this.sessions.delete(userId);
        this.gateway.sendStatusToUser(userId, 'DISCONNECTED');

        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        if (loggedOut) {
          this.logger.log(`Sessão deslogada para ${userId}. Removendo sessão.`);
          await this.sessionRepository.delete(userId);
        } else {
          this.logger.log(`Conexão encerrada para ${userId} (código ${statusCode}). Reconectando...`);
          await this.startSession(userId).catch((err) =>
            this.logger.error(`Erro ao reconectar ${userId}:`, err),
          );
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const message of messages) {
        await this.handleIncomingMessage(userId, sock, message).catch((err) =>
          this.logger.error(`Erro ao processar mensagem:`, err),
        );
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
      throw new Error('Sessão WhatsApp não está ativa. Conecte-se antes de enviar mensagens.');
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

  private async handleIncomingMessage(userId: string, sock: WASocket, message: any) {
    const jid = message.key?.remoteJid;
    if (!jid || jid.endsWith('@g.us') || jid.endsWith('@broadcast')) return;
    if (message.key?.fromMe) return;

    const messageText =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      null;

    if (!messageText || messageText.trim() === '') return;

    const leadPhoneNumber = '+' + jid.replace('@s.whatsapp.net', '');
    const botPhoneNumber = sock.user?.id
      ? '+' + sock.user.id.split(':')[0].split('@')[0]
      : '';
    const leadName = message.pushName || null;

    this.logger.log(
      `Mensagem de ${leadName ?? leadPhoneNumber} → ${botPhoneNumber}: ${messageText}`,
    );

    const { conversationId, userId: resolvedUserId, messagesToSend } =
      await this.processMessageUseCase.execute({
        botPhoneNumber,
        leadPhoneNumber,
        messageText,
        leadName,
      });

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
