import { Injectable } from '@nestjs/common';
import { IFlowNodeRepository } from 'src/domain/repositories/flow-node.repository';
import { INodeOptionRepository } from 'src/domain/repositories/node-option.repository';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  nodeId: string;
}

@Injectable()
export class DeleteNodeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly kanbanRepository: IKanbanRepository,
    private readonly flowNodeRepository: IFlowNodeRepository,
    private readonly nodeOptionRepository: INodeOptionRepository,
  ) {}

  async execute({ userId, nodeId }: Input): Promise<void> {
    const user = await this.userRepository.get(userId);
    if (!user) throw new Error('User not found');

    const node = await this.flowNodeRepository.get(nodeId);
    if (!node) throw new Error('Node not found');

    const kanban = await this.kanbanRepository.get(node.kanbanId.toString());
    if (!kanban) throw new Error('Kanban not found');

    if (!kanban.belongsTo(user.id)) {
      throw new Error('User does not own this kanban');
    }

    // Soft delete opções e referências ao nó deletado
    await this.nodeOptionRepository.deleteByNodeId(nodeId);
    await this.flowNodeRepository.clearNextNodeReferences(nodeId);
    await this.nodeOptionRepository.clearNextNodeReferences(nodeId);

    // Se era o startNode do kanban, limpar referência
    if (kanban.startNodeId === nodeId) {
      kanban.updateStartNode(null);
      await this.kanbanRepository.update(kanban);
    }

    node.delete();
    await this.flowNodeRepository.save(node);
  }
}
