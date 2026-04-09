import { WhatsAppSessionEntity } from '../entities/whatsapp-session.entity';

export abstract class IWhatsAppSessionRepository {
  abstract findByUserId(userId: string): Promise<WhatsAppSessionEntity | null>;
  abstract save(session: WhatsAppSessionEntity): Promise<void>;
  abstract delete(userId: string): Promise<void>;
  abstract findAllUserIds(): Promise<string[]>;
}
