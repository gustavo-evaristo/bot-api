import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListConversationsUseCase } from './list-conversations.use-case';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';

describe('ListConversationsUseCase', () => {
  let conversationRepository: IConversationRepository;
  let useCase: ListConversationsUseCase;

  beforeEach(() => {
    conversationRepository = { findManyByUserId: vi.fn() } as unknown as IConversationRepository;
    useCase = new ListConversationsUseCase(conversationRepository);
  });

  it('should return conversations for the user', async () => {
    const conversations = [
      {
        id: 'c-1',
        leadPhoneNumber: '+5511999999999',
        leadName: null,
        status: 'ACTIVE',
        kanbanId: 'k-1',
        kanbanTitle: 'Kanban',
        lastMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(conversationRepository.findManyByUserId).mockResolvedValue(conversations);

    const result = await useCase.execute({ userId: 'u-1' });

    expect(result.conversations).toEqual(conversations);
    expect(conversationRepository.findManyByUserId).toHaveBeenCalledWith('u-1');
  });

  it('should return empty array when no conversations exist', async () => {
    vi.mocked(conversationRepository.findManyByUserId).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'u-1' });

    expect(result.conversations).toEqual([]);
  });
});
