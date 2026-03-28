import { Injectable } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';

@Injectable()
export class WhatsappService {
  private sessions = new Map<string, Client>();

  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly processMessageUseCase: ProcessMessageUseCase,
  ) {}

  async startSession(userId: string) {
    if (this.sessions.has(userId)) {
      console.log(`Sessão já existe para ${userId}`);
      return;
    }

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: { headless: true },
    });

    client.on('qr', async (qr) => {
      const qrImage = await QRCode.toDataURL(qr);
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

    this.sessions.set(userId, client);
    await client.initialize();
  }

  private async handleIncomingMessage(client: Client, message: Message) {
    // Ignora mensagens de grupos (IDs de grupo terminam com @g.us)
    if (message.from.endsWith('@g.us')) return;

    // Extrai número limpo (ex: "5511999999999@c.us" → "5511999999999")
    const phoneNumber = message.from.split('@')[0];
    const messageText = message.body;

    console.log(`Mensagem recebida de ${phoneNumber}: ${messageText}`);

    try {
      const { messagesToSend } = await this.processMessageUseCase.execute({
        phoneNumber,
        messageText,
      });

      for (const text of messagesToSend) {
        await client.sendMessage(message.from, text);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }
}
