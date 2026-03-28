import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessMessageUseCase } from './process-message.use-case';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IConversationProgressRepository } from 'src/domain/repositories/conversation-progress.repository';
import { ILeadResponseRepository } from 'src/domain/repositories/lead-response.repository';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { ConversationEntity } from 'src/domain/entities/conversation.entity';
import { ConversationProgressEntity } from 'src/domain/entities/conversation-progress.entity';
import { ContentType } from 'src/domain/entities/stage-content.entity';
import { UUID } from 'src/domain/entities/vos';

// ---------- helpers ----------

const makeKanban = () =>
  new KanbanEntity({
    userId: UUID.generate().toString(),
    title: 'Test Kanban',
    description: 'Desc',
    phoneNumber: '5511999999999',
    isActive: true,
  });

const makeDetails = (contents: { id: string; contentType: ContentType; answers?: any[] }[]) => ({
  id: 'kanban-1',
  title: 'Test Kanban',
  description: 'Desc',
  userId: 'user-1',
  stages: [
    {
      id: 'stage-1',
      title: 'Stage 1',
      description: '',
      order: 0,
      contents: contents.map((c, i) => ({
        order: i,
        answers: [],
        ...c,
        content: `Message ${c.id}`,
      })),
    },
  ],
});

const makeConversation = (kanbanId: string) =>
  new ConversationEntity({ kanbanId, leadPhoneNumber: '5511999999999' });

const makeProgress = (conversationId: string, contentId: string, waiting = false) =>
  new ConversationProgressEntity({
    conversationId,
    currentStageId: 'stage-1',
    currentStageContentId: contentId,
    waitingForResponse: waiting,
  });

// ---------- setup ----------

describe('ProcessMessageUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let conversationRepository: IConversationRepository;
  let progressRepository: IConversationProgressRepository;
  let leadResponseRepository: ILeadResponseRepository;
  let useCase: ProcessMessageUseCase;

  beforeEach(() => {
    kanbanRepository = {
      findByPhoneNumber: vi.fn(),
      getDetails: vi.fn(),
    } as unknown as IKanbanRepository;

    conversationRepository = {
      create: vi.fn(),
      findActive: vi.fn(),
      update: vi.fn(),
    } as unknown as IConversationRepository;

    progressRepository = {
      create: vi.fn(),
      findByConversationId: vi.fn(),
      update: vi.fn(),
    } as unknown as IConversationProgressRepository;

    leadResponseRepository = {
      create: vi.fn(),
    } as unknown as ILeadResponseRepository;

    useCase = new ProcessMessageUseCase(
      kanbanRepository,
      conversationRepository,
      progressRepository,
      leadResponseRepository,
    );
  });

  // ---- no kanban ----

  it('should return a default message when no kanban is found for the number', async () => {
    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(null);

    const { messagesToSend } = await useCase.execute({
      phoneNumber: '5511000000000',
      messageText: 'Hello',
    });

    expect(messagesToSend).toHaveLength(1);
    expect(messagesToSend[0]).toContain('não há atendimento');
  });

  // ---- new conversation with TEXT ----

  it('should send all consecutive TEXT messages when starting a new conversation', async () => {
    const kanban = makeKanban();
    const details = makeDetails([
      { id: 'c1', contentType: ContentType.TEXT },
      { id: 'c2', contentType: ContentType.TEXT },
    ]);

    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    vi.mocked(conversationRepository.findActive).mockResolvedValue(null);
    vi.mocked(conversationRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.update).mockResolvedValue();
    vi.mocked(conversationRepository.update).mockResolvedValue();

    const { messagesToSend } = await useCase.execute({
      phoneNumber: '5511999999999',
      messageText: 'Hello',
    });

    expect(messagesToSend).toHaveLength(2);
    expect(messagesToSend[0]).toBe('Message c1');
    expect(messagesToSend[1]).toBe('Message c2');
  });

  it('should stop and wait for response when hitting FREE_INPUT', async () => {
    const kanban = makeKanban();
    const details = makeDetails([
      { id: 'c1', contentType: ContentType.TEXT },
      { id: 'c2', contentType: ContentType.FREE_INPUT },
      { id: 'c3', contentType: ContentType.TEXT },
    ]);

    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    vi.mocked(conversationRepository.findActive).mockResolvedValue(null);
    vi.mocked(conversationRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.update).mockResolvedValue();

    const { messagesToSend } = await useCase.execute({
      phoneNumber: '5511999999999',
      messageText: 'Hi',
    });

    // Should send TEXT then FREE_INPUT question, but not c3
    expect(messagesToSend).toHaveLength(2);
    expect(messagesToSend[1]).toBe('Message c2');
  });

  it('should send numbered options for MULTIPLE_CHOICE', async () => {
    const kanban = makeKanban();
    const details = makeDetails([
      {
        id: 'c1',
        contentType: ContentType.MULTIPLE_CHOICE,
        answers: [
          { id: 'a1', content: 'Yes', score: 10 },
          { id: 'a2', content: 'No', score: 0 },
        ],
      },
    ]);

    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    vi.mocked(conversationRepository.findActive).mockResolvedValue(null);
    vi.mocked(conversationRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.update).mockResolvedValue();

    const { messagesToSend } = await useCase.execute({
      phoneNumber: '5511999999999',
      messageText: 'Hi',
    });

    expect(messagesToSend).toHaveLength(1);
    expect(messagesToSend[0]).toContain('1. Yes');
    expect(messagesToSend[0]).toContain('2. No');
  });

  // ---- replying to FREE_INPUT ----

  it('should save lead response and advance to next content', async () => {
    const kanban = makeKanban();
    const details = makeDetails([
      { id: 'c1', contentType: ContentType.FREE_INPUT },
      { id: 'c2', contentType: ContentType.TEXT },
    ]);

    const conversation = makeConversation(kanban.id.toString());
    const progress = makeProgress(conversation.id.toString(), 'c1', true);

    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    vi.mocked(conversationRepository.findActive).mockResolvedValue(conversation);
    vi.mocked(progressRepository.findByConversationId).mockResolvedValue(progress);
    vi.mocked(leadResponseRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.update).mockResolvedValue();
    vi.mocked(conversationRepository.update).mockResolvedValue();

    const { messagesToSend } = await useCase.execute({
      phoneNumber: '5511999999999',
      messageText: 'I want to know more!',
    });

    expect(leadResponseRepository.create).toHaveBeenCalledOnce();
    expect(messagesToSend).toHaveLength(1);
    expect(messagesToSend[0]).toBe('Message c2');
  });

  // ---- replying to MULTIPLE_CHOICE ----

  it('should associate answerId and score when saving a multiple choice response', async () => {
    const kanban = makeKanban();
    const details = makeDetails([
      {
        id: 'c1',
        contentType: ContentType.MULTIPLE_CHOICE,
        answers: [
          { id: 'a1', content: 'Yes', score: 10 },
          { id: 'a2', content: 'No', score: 0 },
        ],
      },
    ]);

    const conversation = makeConversation(kanban.id.toString());
    const progress = makeProgress(conversation.id.toString(), 'c1', true);

    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    vi.mocked(conversationRepository.findActive).mockResolvedValue(conversation);
    vi.mocked(progressRepository.findByConversationId).mockResolvedValue(progress);
    vi.mocked(leadResponseRepository.create).mockResolvedValue();
    vi.mocked(progressRepository.update).mockResolvedValue();
    vi.mocked(conversationRepository.update).mockResolvedValue();

    await useCase.execute({ phoneNumber: '5511999999999', messageText: 'Yes' });

    const savedResponse = vi.mocked(leadResponseRepository.create).mock.calls[0][0];
    expect(savedResponse.answerId).toBe('a1');
    expect(savedResponse.score).toBe(10);
  });

  // ---- end of flow ----

  it('should finish the conversation after the last StageContent', async () => {
    const kanban = makeKanban();
    const details = makeDetails([{ id: 'c1', contentType: ContentType.FREE_INPUT }]);

    const conversation = makeConversation(kanban.id.toString());
    const progress = makeProgress(conversation.id.toString(), 'c1', true);

    vi.mocked(kanbanRepository.findByPhoneNumber).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    vi.mocked(conversationRepository.findActive).mockResolvedValue(conversation);
    vi.mocked(progressRepository.findByConversationId).mockResolvedValue(progress);
    vi.mocked(leadResponseRepository.create).mockResolvedValue();
    vi.mocked(conversationRepository.update).mockResolvedValue();

    await useCase.execute({ phoneNumber: '5511999999999', messageText: 'Final answer' });

    const updatedConversation = vi.mocked(conversationRepository.update).mock.calls[0][0];
    expect(updatedConversation.isActive()).toBe(false);
  });
});
