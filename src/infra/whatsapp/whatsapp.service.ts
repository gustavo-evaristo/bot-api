import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import { WhatsappGateway } from './whatsapp.gateway';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import {
  MessageHistoryEntity,
  MessageSender,
} from 'src/domain/entities/message-history.entity';
import { UUID } from 'src/domain/entities/vos';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private sessions = new Map<string, Client>();

  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly processMessageUseCase: ProcessMessageUseCase,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
  ) {}

  async onModuleInit() {
    const authDir = '.wwebjs_auth';
    if (!fs.existsSync(authDir)) return;

    const dirs = fs.readdirSync(authDir);

    for (const dir of dirs) {
      if (dir.startsWith('session-')) {
        const userId = dir.replace('session-', '');
        console.log(`Restaurando sessão WhatsApp para usuário: ${userId}`);
        this.startSession(userId).catch((err) =>
          console.error(`Erro ao restaurar sessão ${userId}:`, err),
        );
      }
    }
  }

  async startSession(userId: string) {
    if (this.sessions.has(userId)) {
      console.log(`Sessão já existe para ${userId}`);
      return;
    }

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: { headless: true },
    });

    this.sessions.set(userId, client);

    client.on('qr', async (qr) => {
      const qrImage = await QRCode.toDataURL(qr);
      console.log(qrImage);
      this.gateway.sendQrToUser(userId, qrImage);
    });

    client.on('ready', () => {
      this.gateway.sendStatusToUser(userId, 'CONNECTED');
      const phone = client.info?.wid?.user;
      console.log(`WhatsApp conectado! Número: ${phone}`);
    });

    client.on('message', async (message: Message) => {
      await this.handleIncomingMessage(client, message);
    });

    client.on('disconnected', (reason) => {
      console.log(`WhatsApp desconectado para ${userId}`, reason);
      this.gateway.sendStatusToUser(userId, 'DISCONNECTED');
      this.sessions.delete(userId);
    });

    await client.initialize();
  }

  private async handleIncomingMessage(client: Client, message: Message) {
    if (message.from.endsWith('@g.us')) return;
    if (!message.body || message.body.trim() === '') return;

    const contact = await message.getContact();
    const leadPhoneNumber = '+' + contact.number;
    const botPhoneNumber = '+' + client.info.wid.user;
    const messageText = message.body;
    const leadName = contact.name || contact.pushname || null;

    console.log(
      `Mensagem recebida de nome: ${leadName}, número: ${leadPhoneNumber} para ${botPhoneNumber}: ${messageText}`,
    );

    try {
      const { conversationId, userId, messagesToSend } =
        await this.processMessageUseCase.execute({
          botPhoneNumber,
          leadPhoneNumber,
          messageText,
          leadName,
        });

      if (conversationId && userId) {
        const leadCreatedAt = new Date();

        await this.messageHistoryRepository.create(
          new MessageHistoryEntity({
            conversationId: UUID.from(conversationId),
            sender: MessageSender.LEAD,
            content: messageText,
          }),
        );

        this.gateway.sendNewMessage(userId, {
          conversationId,
          sender: 'LEAD',
          content: messageText,
          createdAt: leadCreatedAt,
        });
      }

      for (const text of messagesToSend) {
        await client.sendMessage(message.from, text);

        if (conversationId && userId) {
          const botCreatedAt = new Date();

          await this.messageHistoryRepository.create(
            new MessageHistoryEntity({
              conversationId: UUID.from(conversationId),
              sender: MessageSender.BOT,
              content: text,
            }),
          );

          this.gateway.sendNewMessage(userId, {
            conversationId,
            sender: 'BOT',
            content: text,
            createdAt: botCreatedAt,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }
}
