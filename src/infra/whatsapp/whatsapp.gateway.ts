// whatsapp.gateway.ts

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface NewMessagePayload {
  conversationId: string;
  sender: 'BOT' | 'LEAD';
  content: string;
  createdAt: Date;
  whatsappMessageId?: string | null;
  status?: string;
}

export interface MessageStatusPayload {
  conversationId: string;
  whatsappMessageId: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  statusUpdatedAt: Date;
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
    }
  }

  sendQrToUser(userId: string, qr: string) {
    this.server.to(userId).emit('qr', qr);
  }

  sendStatusToUser(userId: string, status: string) {
    this.server.to(userId).emit('status', status);
  }

  sendNewMessage(userId: string, payload: NewMessagePayload) {
    this.server.to(userId).emit('new_message', payload);
  }

  sendMessageStatus(userId: string, payload: MessageStatusPayload) {
    this.server.to(userId).emit('message_status', payload);
  }
}
