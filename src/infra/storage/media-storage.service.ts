import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_STORAGE_CLIENT,
} from './storage.constants';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name);

  constructor(
    @Optional()
    @Inject(SUPABASE_STORAGE_CLIENT)
    private readonly supabase: SupabaseClient | null,
    @Inject(SUPABASE_STORAGE_BUCKET)
    private readonly bucket: string,
  ) {}

  isEnabled(): boolean {
    return this.supabase !== null;
  }

  /**
   * Sobe uma imagem para o Storage e retorna a URL publica.
   * Retorna null se Storage nao estiver configurado, ou se a imagem
   * exceder o limite de tamanho — UI funciona sem a imagem nesses casos.
   */
  async uploadImage(
    buffer: Buffer,
    path: string,
    mimeType: string,
  ): Promise<string | null> {
    if (!this.supabase) {
      this.logger.warn(
        'Supabase Storage nao configurado — imagem nao sera persistida',
      );
      return null;
    }
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      this.logger.warn(
        `Imagem excede ${MAX_IMAGE_BYTES} bytes (${buffer.byteLength}) — ignorada`,
      );
      return null;
    }

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Falha ao subir imagem (${path}):`, error.message);
      return null;
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
