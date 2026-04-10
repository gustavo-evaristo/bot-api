import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateKanbanPhoneNumberController } from './update-kanban-phone-number.controller';
import { UpdateKanbanPhoneNumberUseCase } from 'src/domain/use-cases';

describe('UpdateKanbanPhoneNumberController', () => {
  let updateKanbanPhoneNumberUseCase: UpdateKanbanPhoneNumberUseCase;
  let controller: UpdateKanbanPhoneNumberController;

  beforeEach(() => {
    updateKanbanPhoneNumberUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateKanbanPhoneNumberUseCase;
    controller = new UpdateKanbanPhoneNumberController(
      updateKanbanPhoneNumberUseCase,
    );
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(updateKanbanPhoneNumberUseCase.execute).mockResolvedValue(
      undefined as any,
    );

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle(
      { id: 'k-1', phoneNumber: '+5511999999999' },
      req,
    );

    expect(updateKanbanPhoneNumberUseCase.execute).toHaveBeenCalledWith({
      id: 'k-1',
      phoneNumber: '+5511999999999',
      userId: 'u-1',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(updateKanbanPhoneNumberUseCase.execute).mockRejectedValue(
      new Error('Kanban not found'),
    );
    await expect(
      controller.handle({ id: 'k-1', phoneNumber: '111' }, {
        user: { id: 'u-1' },
      } as any),
    ).rejects.toThrow('Kanban not found');
  });
});
