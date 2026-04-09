// whatsapp.gateway.ts

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface NewMessagePayload {
  conversationId: string;
  sender: 'BOT' | 'LEAD';
  content: string;
  createdAt: Date;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class WhatsappGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      client.join(userId);
      console.log(`Socket conectado na room ${userId}`);
    }
  }

  sendQrToUser(userId: string, qr: string) {
    this.server.to(userId).emit('qr', qr);
  }

  sendStatusToUser(userId: string, status: string) {
    this.server.to(userId).emit('status', status);
  }

  sendNewMessage(userId: string, payload: NewMessagePayload) {
    console.log('emitindo msg', payload.content);
    this.server.to(userId).emit('new_message', payload);
  }
}
