import { describe, it, expect } from 'vitest';
import { LeadResponseEntity } from './lead-response.entity';
import { UUID } from './vos';

describe('LeadResponseEntity', () => {
  it('should create entity with required fields', () => {
    const conversationId = UUID.generate().toString();
    const response = new LeadResponseEntity({
      conversationId,
      nodeId: 'node-1',
      responseText: 'Yes, I am interested!',
    });

    expect(response.id).toBeInstanceOf(UUID);
    expect(response.conversationId.toString()).toBe(conversationId);
    expect(response.nodeId).toBe('node-1');
    expect(response.responseText).toBe('Yes, I am interested!');
    expect(response.nodeOptionId).toBeNull();
    expect(response.score).toBeNull();
  });

  it('should store nodeOptionId and score when provided', () => {
    const response = new LeadResponseEntity({
      conversationId: UUID.generate().toString(),
      nodeId: 'node-2',
      responseText: 'Option 1',
      nodeOptionId: 'option-abc',
      score: 10,
    });

    expect(response.nodeOptionId).toBe('option-abc');
    expect(response.score).toBe(10);
  });
});
