import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetConversationUseCase } from './get-conversation.use-case';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageHistoryEntity, MessageSender } from 'src/domain/entities/message-history.entity';
import { UUID } from 'src/domain/entities/vos';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const makeConversationDetail = (kanbanUserId: string) => ({
  id: 'conv-1',
  leadPhoneNumber: '+5511999999999',
  status: 'ACTIVE',
  kanbanTitle: 'Kanban A',
  kanbanUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeMessage = (sender: MessageSender) =>
  new MessageHistoryEntity({
    conversationId: UUID.from('conv-1'),
    sender,
    content: 'Hello',
  });

describe('GetConversationUseCase', () => {
  let conversationRepository: IConversationRepository;
  let messageHistoryRepository: IMessageHistoryRepository;
  let useCase: GetConversationUseCase;

  beforeEach(() => {
    conversationRepository = { findById: vi.fn() } as unknown as IConversationRepository;
    messageHistoryRepository = { findManyByConversationId: vi.fn() } as unknown as IMessageHistoryRepository;
    useCase = new GetConversationUseCase(conversationRepository, messageHistoryRepository);
  });

  it('should throw NotFoundException if conversation not found', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(null);
    await expect(useCase.execute({ conversationId: 'conv-1', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user does not own the kanban', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(makeConversationDetail('other-user'));
    await expect(useCase.execute({ conversationId: 'conv-1', userId: 'u-1' })).rejects.toThrow(ForbiddenException);
  });

  it('should return conversation with mapped messages', async () => {
    const userId = 'u-1';
    const detail = makeConversationDetail(userId);
    const messages = [makeMessage(MessageSender.BOT), makeMessage(MessageSender.LEAD)];
    vi.mocked(conversationRepository.findById).mockResolvedValue(detail);
    vi.mocked(messageHistoryRepository.findManyByConversationId).mockResolvedValue(messages);

    const result = await useCase.execute({ conversationId: 'conv-1', userId });

    expect(result.id).toBe('conv-1');
    expect(result.kanbanTitle).toBe('Kanban A');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].sender).toBe(MessageSender.BOT);
    expect(result.messages[1].sender).toBe(MessageSender.LEAD);
  });

  it('should return empty messages array when no messages', async () => {
    const userId = 'u-1';
    vi.mocked(conversationRepository.findById).mockResolvedValue(makeConversationDetail(userId));
    vi.mocked(messageHistoryRepository.findManyByConversationId).mockResolvedValue([]);

    const result = await useCase.execute({ conversationId: 'conv-1', userId });

    expect(result.messages).toEqual([]);
  });
});
