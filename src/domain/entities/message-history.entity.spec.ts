import { describe, it, expect } from 'vitest';
import { MessageHistoryEntity, MessageSender } from './message-history.entity';
import { UUID } from './vos';

describe('MessageHistoryEntity', () => {
  describe('constructor', () => {
    it('should auto-generate id when not provided', () => {
      const entity = new MessageHistoryEntity({
        conversationId: UUID.generate(),
        sender: MessageSender.BOT,
        content: 'Hello',
      });
      expect(entity.id).toBeInstanceOf(UUID);
    });

    it('should use provided id string', () => {
      const entity = new MessageHistoryEntity({
        id: 'custom-id',
        conversationId: UUID.generate(),
        sender: MessageSender.LEAD,
        content: 'Hi',
      });
      expect(entity.id.toString()).toBe('custom-id');
    });

    it('should set BOT sender', () => {
      const entity = new MessageHistoryEntity({
        conversationId: UUID.generate(),
        sender: MessageSender.BOT,
        content: 'Hello from bot',
      });
      expect(entity.sender).toBe(MessageSender.BOT);
    });

    it('should set LEAD sender', () => {
      const entity = new MessageHistoryEntity({
        conversationId: UUID.generate(),
        sender: MessageSender.LEAD,
        content: 'Hello from lead',
      });
      expect(entity.sender).toBe(MessageSender.LEAD);
    });

    it('should set content correctly', () => {
      const entity = new MessageHistoryEntity({
        conversationId: UUID.generate(),
        sender: MessageSender.BOT,
        content: 'Test message',
      });
      expect(entity.content).toBe('Test message');
    });

    it('should set default createdAt when not provided', () => {
      const before = new Date();
      const entity = new MessageHistoryEntity({
        conversationId: UUID.generate(),
        sender: MessageSender.BOT,
        content: 'Hi',
      });
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('should use provided createdAt', () => {
      const date = new Date('2024-01-01');
      const entity = new MessageHistoryEntity({
        conversationId: UUID.generate(),
        sender: MessageSender.BOT,
        content: 'Hi',
        createdAt: date,
      });
      expect(entity.createdAt).toEqual(date);
    });

    it('should accept UUID instance for conversationId', () => {
      const convId = UUID.generate();
      const entity = new MessageHistoryEntity({
        conversationId: convId,
        sender: MessageSender.BOT,
        content: 'Hi',
      });
      expect(entity.conversationId.toString()).toBe(convId.toString());
    });
  });
});
