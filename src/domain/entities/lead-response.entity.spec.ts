import { describe, it, expect } from 'vitest';
import { LeadResponseEntity } from './lead-response.entity';
import { UUID } from './vos';

describe('LeadResponseEntity', () => {
  it('should create entity with required fields', () => {
    const conversationId = UUID.generate().toString();
    const response = new LeadResponseEntity({
      conversationId,
      stageContentId: 'content-1',
      responseText: 'Yes, I am interested!',
    });

    expect(response.id).toBeInstanceOf(UUID);
    expect(response.conversationId.toString()).toBe(conversationId);
    expect(response.stageContentId).toBe('content-1');
    expect(response.responseText).toBe('Yes, I am interested!');
    expect(response.answerId).toBeNull();
    expect(response.score).toBeNull();
  });

  it('should store answerId and score when provided', () => {
    const response = new LeadResponseEntity({
      conversationId: UUID.generate().toString(),
      stageContentId: 'content-2',
      responseText: 'Option 1',
      answerId: 'answer-abc',
      score: 10,
    });

    expect(response.answerId).toBe('answer-abc');
    expect(response.score).toBe(10);
  });
});
