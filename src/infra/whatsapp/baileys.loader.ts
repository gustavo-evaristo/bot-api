import type * as BaileysType from '@whiskeysockets/baileys';

// Baileys v7 is ESM-only. In a NestJS CommonJS project, TypeScript compiles
// dynamic import() to require(), which cannot load ESM modules. Using
// new Function preserves the native import() call at runtime.
const nativeImport = new Function('m', 'return import(m)') as (m: string) => Promise<typeof BaileysType>;

let cached: typeof BaileysType | null = null;

export async function loadBaileys(): Promise<typeof BaileysType> {
  if (!cached) {
    cached = await nativeImport('@whiskeysockets/baileys');
  }
  return cached;
}
