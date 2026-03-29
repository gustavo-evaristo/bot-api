import { describe, it, expect } from 'vitest';
import { AnswerEntity } from './question.entity';
import { UUID } from './vos';

describe('AnswerEntity', () => {
  describe('constructor', () => {
    it('should auto-generate id when not provided', () => {
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer A',
        score: 10,
      });
      expect(entity.id).toBeInstanceOf(UUID);
    });

    it('should use provided id string', () => {
      const entity = new AnswerEntity({
        id: 'my-custom-id',
        stageContentId: UUID.generate(),
        content: 'Answer B',
        score: 5,
      });
      expect(entity.id.toString()).toBe('my-custom-id');
    });

    it('should use provided UUID instance as id', () => {
      const id = UUID.generate();
      const entity = new AnswerEntity({
        id,
        stageContentId: UUID.generate(),
        content: 'Answer C',
        score: 3,
      });
      expect(entity.id).toBe(id);
    });

    it('should auto-generate id when id is null', () => {
      const entity = new AnswerEntity({
        id: null,
        stageContentId: UUID.generate(),
        content: 'Answer D',
        score: 0,
      });
      expect(entity.id).toBeInstanceOf(UUID);
    });

    it('should accept string stageContentId', () => {
      const stageContentId = UUID.generate().toString();
      const entity = new AnswerEntity({
        stageContentId,
        content: 'Answer E',
        score: 1,
      });
      expect(entity.stageContentId.toString()).toBe(stageContentId);
    });

    it('should accept UUID instance as stageContentId', () => {
      const stageContentId = UUID.generate();
      const entity = new AnswerEntity({
        stageContentId,
        content: 'Answer F',
        score: 2,
      });
      expect(entity.stageContentId).toBe(stageContentId);
    });

    it('should default isDeleted to false when not provided', () => {
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer G',
        score: 7,
      });
      expect(entity.isDeleted).toBe(false);
    });

    it('should use provided isDeleted value', () => {
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer H',
        score: 7,
        isDeleted: true,
      });
      expect(entity.isDeleted).toBe(true);
    });

    it('should set content correctly', () => {
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'My answer content',
        score: 4,
      });
      expect(entity.content).toBe('My answer content');
    });

    it('should set score correctly', () => {
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Scored answer',
        score: 42,
      });
      expect(entity.score).toBe(42);
    });

    it('should set default createdAt when not provided', () => {
      const before = new Date();
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer I',
        score: 0,
      });
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should use provided createdAt', () => {
      const date = new Date('2024-06-01');
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer J',
        score: 0,
        createdAt: date,
      });
      expect(entity.createdAt).toEqual(date);
    });

    it('should default updatedAt to createdAt when not provided', () => {
      const date = new Date('2024-06-01');
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer K',
        score: 0,
        createdAt: date,
      });
      expect(entity.updatedAt).toEqual(date);
    });

    it('should use provided updatedAt', () => {
      const createdAt = new Date('2024-06-01');
      const updatedAt = new Date('2024-07-01');
      const entity = new AnswerEntity({
        stageContentId: UUID.generate(),
        content: 'Answer L',
        score: 0,
        createdAt,
        updatedAt,
      });
      expect(entity.updatedAt).toEqual(updatedAt);
    });
  });
});
