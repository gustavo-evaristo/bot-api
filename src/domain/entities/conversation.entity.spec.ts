import { describe, it, expect } from 'vitest';
import { ConversationEntity, ConversationStatus } from './conversation.entity';
import { UUID } from './vos';

const makeConversation = () =>
  new ConversationEntity({
    kanbanId: UUID.generate().toString(),
    leadPhoneNumber: '5511999999999',
  });

describe('ConversationEntity', () => {
  describe('constructor', () => {
    it('should auto-generate id', () => {
      const conversation = makeConversation();
      expect(conversation.id).toBeInstanceOf(UUID);
    });

    it('should default status to ACTIVE', () => {
      const conversation = makeConversation();
      expect(conversation.status).toBe(ConversationStatus.ACTIVE);
    });

    it('should accept a provided status', () => {
      const conversation = new ConversationEntity({
        kanbanId: UUID.generate().toString(),
        leadPhoneNumber: '5511999999999',
        status: ConversationStatus.FINISHED,
      });
      expect(conversation.status).toBe(ConversationStatus.FINISHED);
    });
  });

  describe('finish()', () => {
    it('should set status to FINISHED', () => {
      const conversation = makeConversation();
      conversation.finish();
      expect(conversation.status).toBe(ConversationStatus.FINISHED);
    });

    it('should update updatedAt', () => {
      const conversation = makeConversation();
      const before = conversation.updatedAt;
      conversation.finish();
      expect(conversation.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('isActive()', () => {
    it('should return true when status is ACTIVE', () => {
      const conversation = makeConversation();
      expect(conversation.isActive()).toBe(true);
    });

    it('should return false after finish()', () => {
      const conversation = makeConversation();
      conversation.finish();
      expect(conversation.isActive()).toBe(false);
    });
  });
});
