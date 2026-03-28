import { describe, it, expect } from 'vitest';
import { StageEntity } from './stage.entity';
import { UUID } from './vos';

const makeStage = () =>
  new StageEntity({
    kanbanId: UUID.generate().toString(),
    title: 'Stage 1',
    description: 'Stage description',
  });

describe('StageEntity', () => {
  describe('constructor', () => {
    it('should auto-generate id', () => {
      const stage = makeStage();
      expect(stage.id).toBeInstanceOf(UUID);
    });

    it('should default isDeleted to false', () => {
      const stage = makeStage();
      expect(stage.isDeleted).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should set isDeleted to true and update updatedAt', () => {
      const stage = makeStage();
      const before = stage.updatedAt;
      stage.delete();
      expect(stage.isDeleted).toBe(true);
      expect(stage.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('update()', () => {
    it('should update title and description', () => {
      const stage = makeStage();
      stage.update({ title: 'New Title', description: 'New Description' });
      expect(stage.title).toBe('New Title');
      expect(stage.description).toBe('New Description');
    });
  });
});
