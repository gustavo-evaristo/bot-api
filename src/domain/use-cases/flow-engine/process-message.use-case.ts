import { Injectable } from '@nestjs/common';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IConversationProgressRepository } from 'src/domain/repositories/conversation-progress.repository';
import { ILeadResponseRepository } from 'src/domain/repositories/lead-response.repository';
import { ConversationEntity } from 'src/domain/entities/conversation.entity';
import { ConversationProgressEntity } from 'src/domain/entities/conversation-progress.entity';
import { LeadResponseEntity } from 'src/domain/entities/lead-response.entity';
import { ContentType } from 'src/domain/entities/stage-content.entity';
import { KanbanDetails } from 'src/domain/entities/kanban.entity';

interface Input {
  botPhoneNumber: string;
  leadPhoneNumber: string;
  messageText: string;
  leadName?: string | null;
}

interface Output {
  conversationId: string | null;
  messagesToSend: string[];
}

interface StageContent {
  id: string;
  content: string;
  contentType: string;
  order: number;
  answers: { id: string; content: string; score: number }[];
}

interface Stage {
  id: string;
  order: number;
  contents: StageContent[];
}

interface NextPosition {
  stageId: string;
  stageContentId: string;
}

@Injectable()
export class ProcessMessageUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly conversationProgressRepository: IConversationProgressRepository,
    private readonly leadResponseRepository: ILeadResponseRepository,
  ) {}

  async execute({ botPhoneNumber, leadPhoneNumber, messageText, leadName }: Input): Promise<Output> {
    const kanban = await this.kanbanRepository.findByPhoneNumber(botPhoneNumber);

    console.log({ botPhoneNumber, leadPhoneNumber, messageText });

    if (!kanban) {
      return {
        conversationId: null,
        messagesToSend: [
          'Olá! No momento não há atendimento configurado para este número.',
        ],
      };
    }

    const details = await this.kanbanRepository.getDetails(kanban.id.toString());

    if (!details || details.stages.length === 0) {
      return { conversationId: null, messagesToSend: [] };
    }

    let conversation = await this.conversationRepository.findActive(
      kanban.id.toString(),
      leadPhoneNumber,
    );

    // Nova conversa: iniciar do primeiro StageContent
    if (!conversation) {
      conversation = new ConversationEntity({
        kanbanId: kanban.id,
        leadPhoneNumber: leadPhoneNumber,
        leadName: leadName ?? null,
      });

      const firstStage = details.stages[0];
      const firstContent = firstStage.contents[0];

      if (!firstContent) {
        return { conversationId: null, messagesToSend: [] };
      }

      const progress = new ConversationProgressEntity({
        conversationId: conversation.id,
        currentStageId: firstStage.id,
        currentStageContentId: firstContent.id,
        waitingForResponse: false,
      });

      await this.conversationRepository.create(conversation);
      await this.conversationProgressRepository.create(progress);

      return this.executeFromCurrentPosition(progress, details, conversation);
    }

    // Conversa existente: processar resposta do lead
    const progress = await this.conversationProgressRepository.findByConversationId(
      conversation.id.toString(),
    );

    if (!progress || !progress.waitingForResponse) {
      return { conversationId: conversation.id.toString(), messagesToSend: [] };
    }

    const currentContent = this.findContent(details, progress.currentStageContentId);

    if (!currentContent) {
      return { conversationId: conversation.id.toString(), messagesToSend: [] };
    }

    // Salvar resposta do lead
    let answerId: string | null = null;
    let score: number | null = null;

    if (currentContent.contentType === ContentType.MULTIPLE_CHOICE) {
      const trimmed = messageText.trim();
      const indexMatch = parseInt(trimmed, 10);
      const matched = currentContent.answers.find((a, i) =>
        (!isNaN(indexMatch) && indexMatch === i + 1) ||
        a.content.trim().toLowerCase() === trimmed.toLowerCase(),
      );

      if (!matched) {
        const options = currentContent.answers
          .map((a, i) => `${i + 1}. ${a.content}`)
          .join('\n');
        return {
          conversationId: conversation.id.toString(),
          messagesToSend: [
            `Opção inválida. Por favor, escolha uma das alternativas:\n\n${options}\n\n_Digite o número da opção desejada._`,
          ],
        };
      }

      answerId = matched.id;
      score = matched.score;
    }

    const leadResponse = new LeadResponseEntity({
      conversationId: conversation.id,
      stageContentId: currentContent.id,
      responseText: messageText,
      answerId,
      score,
    });

    await this.leadResponseRepository.create(leadResponse);

    // Avançar para próxima posição
    const next = this.getNextPosition(
      details,
      progress.currentStageId,
      progress.currentStageContentId,
    );

    if (!next) {
      conversation.finish();
      await this.conversationRepository.update(conversation);
      return { conversationId: conversation.id.toString(), messagesToSend: [] };
    }

    progress.advanceTo(next.stageId, next.stageContentId);
    await this.conversationProgressRepository.update(progress);

    return this.executeFromCurrentPosition(progress, details, conversation);
  }

  private async executeFromCurrentPosition(
    progress: ConversationProgressEntity,
    details: KanbanDetails,
    conversation: ConversationEntity,
  ): Promise<Output> {
    const messagesToSend: string[] = [];

    while (true) {
      const currentContent = this.findContent(details, progress.currentStageContentId);

      if (!currentContent) break;

      if (currentContent.contentType === ContentType.TEXT) {
        messagesToSend.push(currentContent.content);

        const next = this.getNextPosition(
          details,
          progress.currentStageId,
          progress.currentStageContentId,
        );

        if (!next) {
          conversation.finish();
          await this.conversationRepository.update(conversation);
          break;
        }

        progress.advanceTo(next.stageId, next.stageContentId);
        await this.conversationProgressRepository.update(progress);
      } else {
        // FREE_INPUT ou MULTIPLE_CHOICE: enviar pergunta e aguardar
        let message = currentContent.content;

        if (
          currentContent.contentType === ContentType.MULTIPLE_CHOICE &&
          currentContent.answers.length > 0
        ) {
          const options = currentContent.answers
            .map((a, i) => `${i + 1}. ${a.content}`)
            .join('\n');
          message = `${currentContent.content}\n\n${options}\n\n_Digite o número da opção desejada._`;
        }

        messagesToSend.push(message);
        progress.waitForResponse();
        await this.conversationProgressRepository.update(progress);
        break;
      }
    }

    return { conversationId: conversation.id.toString(), messagesToSend };
  }

  private findContent(details: KanbanDetails, contentId: string): StageContent | null {
    for (const stage of details.stages) {
      const content = stage.contents.find((c) => c.id === contentId);
      if (content) return content;
    }
    return null;
  }

  private getNextPosition(
    details: KanbanDetails,
    currentStageId: string,
    currentContentId: string,
  ): NextPosition | null {
    const stageIndex = details.stages.findIndex((s) => s.id === currentStageId);
    if (stageIndex === -1) return null;

    const stage = details.stages[stageIndex] as Stage;
    const contentIndex = stage.contents.findIndex((c) => c.id === currentContentId);
    if (contentIndex === -1) return null;

    if (contentIndex + 1 < stage.contents.length) {
      return {
        stageId: stage.id,
        stageContentId: stage.contents[contentIndex + 1].id,
      };
    }

    if (stageIndex + 1 < details.stages.length) {
      const nextStage = details.stages[stageIndex + 1] as Stage;
      if (nextStage.contents.length === 0) return null;
      return {
        stageId: nextStage.id,
        stageContentId: nextStage.contents[0].id,
      };
    }

    return null;
  }
}
