import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetConversationController } from './get-conversation.controller';
import { GetConversationUseCase } from 'src/domain/use-cases/conversation/get-conversation.use-case';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const makeOutput = () => ({
  id: 'conv-1',
  leadPhoneNumber: '+5511999999999',
  status: 'ACTIVE',
  kanbanTitle: 'Kanban A',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('GetConversationController', () => {
  let getConversationUseCase: GetConversationUseCase;
  let controller: GetConversationController;

  beforeEach(() => {
    getConversationUseCase = { execute: vi.fn() } as unknown as GetConversationUseCase;
    controller = new GetConversationController(getConversationUseCase);
  });

  it('should call use case and return result', async () => {
    const output = makeOutput();
    vi.mocked(getConversationUseCase.execute).mockResolvedValue(output);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.getConversation('conv-1', req);

    expect(getConversationUseCase.execute).toHaveBeenCalledWith({ conversationId: 'conv-1', userId: 'u-1' });
    expect(result).toEqual(output);
  });

  it('should propagate NotFoundException', async () => {
    vi.mocked(getConversationUseCase.execute).mockRejectedValue(new NotFoundException());
    await expect(controller.getConversation('conv-1', { user: { id: 'u-1' } } as any)).rejects.toThrow(NotFoundException);
  });

  it('should propagate ForbiddenException', async () => {
    vi.mocked(getConversationUseCase.execute).mockRejectedValue(new ForbiddenException());
    await expect(controller.getConversation('conv-1', { user: { id: 'u-1' } } as any)).rejects.toThrow(ForbiddenException);
  });
});
