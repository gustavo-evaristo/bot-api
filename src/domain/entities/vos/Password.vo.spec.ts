import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcrypt';
import { Password } from './Password.vo';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed_password'),
  compareSync: vi.fn(() => true),
}));

const VALID_PASSWORD = 'Senha@123';

describe('Password', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create()', () => {
    it('should create a valid password', () => {
      const password = Password.create(VALID_PASSWORD);
      expect(password).toBeInstanceOf(Password);
      expect(password.value).toBe(VALID_PASSWORD);
    });

    it('should throw if password is shorter than 6 characters', () => {
      expect(() => Password.create('Ab@1')).toThrow(
        'Password must be at least 6 characters long',
      );
    });

    it('should throw if password has no special character', () => {
      expect(() => Password.create('SenhaSemEspecial123')).toThrow(
        'Password must contain at least one special character',
      );
    });
  });

  describe('createWithConfirmation()', () => {
    it('should create password when both passwords match', () => {
      const password = Password.createWithConfirmation(
        VALID_PASSWORD,
        VALID_PASSWORD,
      );
      expect(password.value).toBe(VALID_PASSWORD);
    });

    it('should throw when passwords do not match', () => {
      expect(() =>
        Password.createWithConfirmation(VALID_PASSWORD, 'Outra@123'),
      ).toThrow('Passwords do not match');
    });
  });

  describe('fromHash()', () => {
    it('should create an instance from an existing hash without validation', () => {
      const password = Password.fromHash('$2b$10$somehash');
      expect(password.value).toBe('$2b$10$somehash');
    });
  });

  describe('hash()', () => {
    it('should call bcrypt.hashSync and return the result', () => {
      const password = Password.create(VALID_PASSWORD);
      const hashed = password.hash();
      expect(vi.mocked(bcrypt.hashSync)).toHaveBeenCalledWith(
        VALID_PASSWORD,
        10,
      );
      expect(hashed).toBe('hashed_password');
    });
  });

  describe('compareWithHash()', () => {
    it('should return true when the password matches the hash', () => {
      vi.mocked(bcrypt.compareSync).mockReturnValue(true as any);
      const password = Password.create(VALID_PASSWORD);
      expect(password.compareWithHash('any_hash')).toBe(true);
    });

    it('should return false when the password does not match the hash', () => {
      vi.mocked(bcrypt.compareSync).mockReturnValue(false as any);
      const password = Password.create(VALID_PASSWORD);
      expect(password.compareWithHash('wrong_hash')).toBe(false);
    });
  });
});
