import { describe, it, expect } from 'vitest';
import { ContentType, StageContentEntity } from './stage-content.entity';
import { UUID } from './vos';

const makeContent = (contentType: ContentType = ContentType.TEXT) =>
  new StageContentEntity({
    stageId: UUID.generate().toString(),
    content: 'Test message',
    contentType,
  });

describe('StageContentEntity', () => {
  describe('isMultipleChoicesContent()', () => {
    it('should return true for MULTIPLE_CHOICE', () => {
      const content = makeContent(ContentType.MULTIPLE_CHOICE);
      expect(content.isMultipleChoicesContent()).toBe(true);
    });

    it('should return false for other types', () => {
      expect(makeContent(ContentType.TEXT).isMultipleChoicesContent()).toBe(false);
      expect(makeContent(ContentType.FREE_INPUT).isMultipleChoicesContent()).toBe(false);
    });
  });

  describe('isFreeInputContent()', () => {
    it('should return true for FREE_INPUT', () => {
      const content = makeContent(ContentType.FREE_INPUT);
      expect(content.isFreeInputContent()).toBe(true);
    });

    it('should return false for other types', () => {
      expect(makeContent(ContentType.TEXT).isFreeInputContent()).toBe(false);
      expect(makeContent(ContentType.MULTIPLE_CHOICE).isFreeInputContent()).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should set isDeleted to true', () => {
      const content = makeContent();
      content.delete();
      expect(content.isDeleted).toBe(true);
    });
  });

  describe('update()', () => {
    it('should update content and contentType', () => {
      const content = makeContent();
      content.update({ content: 'New content', contentType: ContentType.FREE_INPUT });
      expect(content.content).toBe('New content');
      expect(content.contentType).toBe(ContentType.FREE_INPUT);
    });
  });
});
