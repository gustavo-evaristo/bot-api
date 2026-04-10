import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageUseCase } from './send-message.use-case';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageSender } from 'src/domain/entities/message-history.entity';
import { ConversationStatus } from 'src/domain/entities/conversation.entity';

const makeConversationDetail = (
  overrides: Partial<{
    status: string;
    kanbanUserId: string;
    leadPhoneNumber: string;
  }> = {},
) => ({
  id: 'conv-1',
  kanbanId: 'k-1',
  leadPhoneNumber: '+5511999999999',
  leadName: 'Maria Silva',
  status: ConversationStatus.FINISHED,
  kanbanTitle: 'Fluxo de cadastro',
  kanbanUserId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('SendMessageUseCase', () => {
  let conversationRepository: IConversationRepository;
  let messageHistoryRepository: IMessageHistoryRepository;
  let useCase: SendMessageUseCase;

  beforeEach(() => {
    conversationRepository = {
      findById: vi.fn(),
    } as unknown as IConversationRepository;

    messageHistoryRepository = {
      create: vi.fn(),
    } as unknown as IMessageHistoryRepository;

    useCase = new SendMessageUseCase(
      conversationRepository,
      messageHistoryRepository,
    );
  });

  it('should save message to history and return leadPhoneNumber', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(
      makeConversationDetail(),
    );
    vi.mocked(messageHistoryRepository.create).mockResolvedValue();

    const result = await useCase.execute({
      conversationId: 'conv-1',
      userId: 'user-1',
      content: 'Olá! Posso ajudar?',
    });

    expect(result.leadPhoneNumber).toBe('+5511999999999');
    expect(messageHistoryRepository.create).toHaveBeenCalledOnce();

    const savedMessage = vi.mocked(messageHistoryRepository.create).mock
      .calls[0][0];
    expect(savedMessage.sender).toBe(MessageSender.BOT);
    expect(savedMessage.content).toBe('Olá! Posso ajudar?');
  });

  it('should throw when conversation is not found', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        conversationId: 'conv-x',
        userId: 'user-1',
        content: 'Oi',
      }),
    ).rejects.toThrow('Conversa não encontrada.');
  });

  it('should throw when user does not own the conversation', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(
      makeConversationDetail({ kanbanUserId: 'other-user' }),
    );

    await expect(
      useCase.execute({
        conversationId: 'conv-1',
        userId: 'user-1',
        content: 'Oi',
      }),
    ).rejects.toThrow('Acesso negado.');
  });

  it('should throw when conversation is not FINISHED', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(
      makeConversationDetail({ status: ConversationStatus.ACTIVE }),
    );

    await expect(
      useCase.execute({
        conversationId: 'conv-1',
        userId: 'user-1',
        content: 'Oi',
      }),
    ).rejects.toThrow(
      'Só é possível enviar mensagens para leads que finalizaram o fluxo.',
    );

    expect(messageHistoryRepository.create).not.toHaveBeenCalled();
  });
});
