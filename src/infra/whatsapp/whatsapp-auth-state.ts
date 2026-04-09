import type { AuthenticationState, SignalDataTypeMap } from '@whiskeysockets/baileys';
import { IWhatsAppSessionRepository } from 'src/domain/repositories/whatsapp-session.repository';
import { WhatsAppSessionEntity } from 'src/domain/entities/whatsapp-session.entity';
import { loadBaileys } from './baileys.loader';

export async function useWhatsAppAuthState(
  userId: string,
  repository: IWhatsAppSessionRepository,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const { BufferJSON, initAuthCreds, proto } = await loadBaileys();

  const stored = await repository.findByUserId(userId);

  let creds = stored?.creds
    ? JSON.parse(stored.creds, BufferJSON.reviver)
    : initAuthCreds();

  let keys: Record<string, any> = stored?.keys
    ? JSON.parse(stored.keys, BufferJSON.reviver)
    : {};

  const session = stored ?? new WhatsAppSessionEntity({ userId });

  const persist = async () => {
    session.updateState(
      JSON.stringify(creds, BufferJSON.replacer),
      JSON.stringify(keys, BufferJSON.replacer),
    );
    await repository.save(session);
  };

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
          const result: { [id: string]: SignalDataTypeMap[T] } = {};
          for (const id of ids) {
            let value = keys[`${type}-${id}`];
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            result[id] = value;
          }
          return result;
        },
        set: async (data: Partial<{ [T in keyof SignalDataTypeMap]: { [id: string]: SignalDataTypeMap[T] } }>) => {
          for (const category in data) {
            const entries = (data as any)[category] as Record<string, any>;
            for (const id in entries) {
              const value = entries[id];
              const key = `${category}-${id}`;
              if (value) {
                keys[key] = value;
              } else {
                delete keys[key];
              }
            }
          }
          await persist();
        },
      },
    },
    saveCreds: persist,
  };
}
