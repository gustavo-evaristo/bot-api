// whatsapp.gateway.ts

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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
}
