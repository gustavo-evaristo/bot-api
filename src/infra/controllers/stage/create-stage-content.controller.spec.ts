import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStageContentController } from './create-stage-content.controller';
import { CreateStageContentUseCase } from 'src/domain/use-cases/stage-content/create-stage.content.use-case';
import { ContentType } from 'src/domain/entities/stage-content.entity';

describe('CreateStageContentController', () => {
  let createStageContentUseCase: CreateStageContentUseCase;
  let controller: CreateStageContentController;

  beforeEach(() => {
    createStageContentUseCase = {
      execute: vi.fn(),
    } as unknown as CreateStageContentUseCase;
    controller = new CreateStageContentController(createStageContentUseCase);
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(createStageContentUseCase.execute).mockResolvedValue();

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle(
      { content: 'Hello', contentType: ContentType.TEXT },
      's-1',
      req,
    );

    expect(createStageContentUseCase.execute).toHaveBeenCalledWith({
      userId: 'u-1',
      stageId: 's-1',
      content: 'Hello',
      contentType: ContentType.TEXT,
      answers: undefined,
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(createStageContentUseCase.execute).mockRejectedValue(
      new Error('Stage not found'),
    );
    await expect(
      controller.handle(
        { content: 'C', contentType: ContentType.TEXT },
        's-1',
        { user: { id: 'u-1' } } as any,
      ),
    ).rejects.toThrow('Stage not found');
  });
});
