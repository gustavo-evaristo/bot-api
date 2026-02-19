import { randomUUID } from 'crypto';

export class UUID {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Gera um novo UUID v4
   */
  public static generate(): UUID {
    return new UUID(randomUUID());
  }

  /**
   * Cria um UUID a partir de um valor existente (ex: banco)
   */
  public static from(value: string): UUID {
    return new UUID(value);
  }

  /**
   * Retorna valor primitivo
   */
  get value(): string {
    return this._value;
  }

  /**
   * Compara dois UUIDs
   */
  public equals(other: UUID): boolean {
    return this._value === other.value;
  }

  /**
   * Facilita uso automático como string
   */
  public toString(): string {
    return this._value;
  }
}
