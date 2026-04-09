import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendMessageController } from './send-message.controller';
import { SendMessageUseCase } from 'src/domain/use-cases/conversation/send-message.use-case';
import { WhatsappService } from 'src/infra/whatsapp/whatsapp.service';

describe('SendMessageController', () => {
  let sendMessageUseCase: SendMessageUseCase;
  let whatsappService: WhatsappService;
  let controller: SendMessageController;

  beforeEach(() => {
    sendMessageUseCase = { execute: vi.fn() } as unknown as SendMessageUseCase;
    whatsappService = { sendMessage: vi.fn() } as unknown as WhatsappService;

    controller = new SendMessageController(sendMessageUseCase, whatsappService);
  });

  it('should call use case, send whatsapp message and return sent:true', async () => {
    vi.mocked(sendMessageUseCase.execute).mockResolvedValue({ leadPhoneNumber: '+5511999999999' });
    vi.mocked(whatsappService.sendMessage).mockResolvedValue();

    const req = { user: { id: 'user-1' } } as any;
    const result = await controller.sendMessage('conv-1', { content: 'Olá!' }, req);

    expect(sendMessageUseCase.execute).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      userId: 'user-1',
      content: 'Olá!',
    });
    expect(whatsappService.sendMessage).toHaveBeenCalledWith(
      'user-1',
      '+5511999999999',
      'Olá!',
      'conv-1',
    );
    expect(result).toEqual({ sent: true });
  });

  it('should propagate error when use case throws', async () => {
    vi.mocked(sendMessageUseCase.execute).mockRejectedValue(
      new Error('Só é possível enviar mensagens para leads que finalizaram o fluxo.'),
    );

    await expect(
      controller.sendMessage('conv-1', { content: 'Oi' }, { user: { id: 'user-1' } } as any),
    ).rejects.toThrow('Só é possível enviar mensagens para leads que finalizaram o fluxo.');

    expect(whatsappService.sendMessage).not.toHaveBeenCalled();
  });
});
