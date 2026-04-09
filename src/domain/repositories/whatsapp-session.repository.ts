export abstract class IWhatsAppSessionRepository {
  abstract findByUserId(userId: string): Promise<{ creds: string; keys: string } | null>;
  abstract save(userId: string, creds: string, keys: string): Promise<void>;
  abstract delete(userId: string): Promise<void>;
  abstract findAllUserIds(): Promise<string[]>;
}
