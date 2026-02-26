// whatsapp.service.ts

import { Injectable } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import { WhatsappGateway } from './whatsapp.gateway';

@Injectable()
export class WhatsappService {
  private sessions = new Map<string, Client>();

  constructor(private gateway: WhatsappGateway) {}

  async startSession(userId: string) {
    if (this.sessions.has(userId)) {
      console.log(`Sessão já existe para ${userId}`);
      return;
    }

    const client = new Client({
      authStrategy: new LocalAuth({}),
      puppeteer: { headless: true },
    });

    client.on('qr', async (qr) => {
      const qrImage = await QRCode.toDataURL(qr);
      console.log({ qrImage });
      this.gateway.sendQrToUser(userId, qrImage);
    });

    client.on('ready', () => {
      this.gateway.sendStatusToUser(userId, 'CONNECTED');

      const info = client.info;
      const phone = info?.wid?.user;

      console.log('WhatsApp conectado!', { info, phone });

      // 🔥 Aqui você salvaria no banco
      // await this.sessionsRepository.update(...)
    });

    client.on('disconnected', (reason) => {
      console.log(`WhatsApp desconectado para ${userId}`, reason);

      this.gateway.sendStatusToUser(userId, 'DISCONNECTED');

      this.sessions.delete(userId);
    });

    await client.initialize();
  }
}
