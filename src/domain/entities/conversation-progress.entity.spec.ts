import { describe, it, expect } from 'vitest';
import { ConversationProgressEntity } from './conversation-progress.entity';
import { UUID } from './vos';

const makeProgress = () =>
  new ConversationProgressEntity({
    conversationId: UUID.generate().toString(),
    currentStageId: 'stage-1',
    currentStageContentId: 'content-1',
  });

describe('ConversationProgressEntity', () => {
  describe('constructor', () => {
    it('should auto-generate id', () => {
      const progress = makeProgress();
      expect(progress.id).toBeInstanceOf(UUID);
    });

    it('should default waitingForResponse to false', () => {
      const progress = makeProgress();
      expect(progress.waitingForResponse).toBe(false);
    });

    it('should accept waitingForResponse=true', () => {
      const progress = new ConversationProgressEntity({
        conversationId: UUID.generate().toString(),
        currentStageId: 'stage-1',
        currentStageContentId: 'content-1',
        waitingForResponse: true,
      });
      expect(progress.waitingForResponse).toBe(true);
    });
  });

  describe('advanceTo()', () => {
    it('should update stageId and contentId', () => {
      const progress = makeProgress();
      progress.advanceTo('stage-2', 'content-5');
      expect(progress.currentStageId).toBe('stage-2');
      expect(progress.currentStageContentId).toBe('content-5');
    });

    it('should reset waitingForResponse to false', () => {
      const progress = makeProgress();
      progress.waitForResponse();
      progress.advanceTo('stage-2', 'content-5');
      expect(progress.waitingForResponse).toBe(false);
    });
  });

  describe('waitForResponse()', () => {
    it('should set waitingForResponse to true', () => {
      const progress = makeProgress();
      progress.waitForResponse();
      expect(progress.waitingForResponse).toBe(true);
    });

    it('should update updatedAt', () => {
      const progress = makeProgress();
      const before = progress.updatedAt;
      progress.waitForResponse();
      expect(progress.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });
});
