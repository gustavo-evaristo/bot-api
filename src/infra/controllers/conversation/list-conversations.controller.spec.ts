import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListConversationsController } from './list-conversations.controller';
import { ListConversationsUseCase } from 'src/domain/use-cases/conversation/list-conversations.use-case';

describe('ListConversationsController', () => {
  let listConversationsUseCase: ListConversationsUseCase;
  let controller: ListConversationsController;

  beforeEach(() => {
    listConversationsUseCase = { execute: vi.fn() } as unknown as ListConversationsUseCase;
    controller = new ListConversationsController(listConversationsUseCase);
  });

  it('should call use case and return result', async () => {
    const output = {
      conversations: [
        { id: 'c-1', leadPhoneNumber: '+5511999999999', status: 'ACTIVE', kanbanId: 'k-1', kanbanTitle: 'Kanban', lastMessage: null, createdAt: new Date(), updatedAt: new Date() },
      ],
    };
    vi.mocked(listConversationsUseCase.execute).mockResolvedValue(output);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.listConversations(req);

    expect(listConversationsUseCase.execute).toHaveBeenCalledWith({ userId: 'u-1' });
    expect(result).toEqual(output);
  });

  it('should return empty conversations array', async () => {
    vi.mocked(listConversationsUseCase.execute).mockResolvedValue({ conversations: [] });
    const result = await controller.listConversations({ user: { id: 'u-1' } } as any);
    expect(result.conversations).toEqual([]);
  });
});
