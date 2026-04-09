import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListLeadsUseCase } from './list-leads.use-case';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';

describe('ListLeadsUseCase', () => {
  let conversationRepository: IConversationRepository;
  let useCase: ListLeadsUseCase;

  beforeEach(() => {
    conversationRepository = {
      findLeadsByUserId: vi.fn(),
    } as unknown as IConversationRepository;
    useCase = new ListLeadsUseCase(conversationRepository);
  });

  it('should return leads for the given userId', async () => {
    const leads = [
      {
        id: 'c-1',
        leadPhoneNumber: '+5511999999999',
        leadName: 'Maria Silva',
        status: 'FINISHED',
        createdAt: new Date('2026-04-01T10:00:00Z'),
      },
      {
        id: 'c-2',
        leadPhoneNumber: '+5511888888888',
        leadName: null,
        status: 'ACTIVE',
        createdAt: new Date('2026-04-07T08:00:00Z'),
      },
    ];
    vi.mocked(conversationRepository.findLeadsByUserId).mockResolvedValue(leads);

    const result = await useCase.execute({ userId: 'u-1' });

    expect(conversationRepository.findLeadsByUserId).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ leads });
  });

  it('should return empty leads array when repository returns nothing', async () => {
    vi.mocked(conversationRepository.findLeadsByUserId).mockResolvedValue([]);

    const result = await useCase.execute({ userId: 'u-1' });

    expect(result.leads).toEqual([]);
  });
});
