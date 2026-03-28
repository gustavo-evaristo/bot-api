import { describe, it, expect } from 'vitest';
import { UUID } from './UUID.vo';

describe('UUID', () => {
  describe('generate()', () => {
    it('should generate a unique UUID on each call', () => {
      const a = UUID.generate();
      const b = UUID.generate();
      expect(a.toString()).not.toBe(b.toString());
    });

    it('should return a UUID instance', () => {
      const uuid = UUID.generate();
      expect(uuid).toBeInstanceOf(UUID);
    });
  });

  describe('from()', () => {
    it('should create a UUID from an existing string', () => {
      const value = 'abc123';
      const uuid = UUID.from(value);
      expect(uuid.toString()).toBe(value);
    });
  });

  describe('equals()', () => {
    it('should return true when values are equal', () => {
      const a = UUID.from('same-id');
      const b = UUID.from('same-id');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false when values are different', () => {
      const a = UUID.from('id-1');
      const b = UUID.from('id-2');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('value', () => {
    it('should expose the internal value via getter', () => {
      const uuid = UUID.from('test-uuid');
      expect(uuid.value).toBe('test-uuid');
    });
  });

  describe('toString()', () => {
    it('should return the value as a string', () => {
      const uuid = UUID.from('to-string-test');
      expect(`${uuid}`).toBe('to-string-test');
    });
  });
});
