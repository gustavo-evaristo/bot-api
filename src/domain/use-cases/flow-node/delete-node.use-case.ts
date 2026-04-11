import { Injectable } from '@nestjs/common';
import { IFlowNodeRepository } from 'src/domain/repositories/flow-node.repository';
import { INodeOptionRepository } from 'src/domain/repositories/node-option.repository';
import { IFlowRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  nodeId: string;
}

@Injectable()
export class DeleteNodeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly flowRepository: IFlowRepository,
    private readonly flowNodeRepository: IFlowNodeRepository,
    private readonly nodeOptionRepository: INodeOptionRepository,
  ) {}

  async execute({ userId, nodeId }: Input): Promise<void> {
    const user = await this.userRepository.get(userId);
    if (!user) throw new Error('User not found');

    const node = await this.flowNodeRepository.get(nodeId);
    if (!node) throw new Error('Node not found');

    const flow = await this.flowRepository.get(node.flowId.toString());
    if (!flow) throw new Error('Flow not found');

    if (!flow.belongsTo(user.id)) {
      throw new Error('User does not own this flow');
    }

    // Soft delete opções e referências ao nó deletado
    await this.nodeOptionRepository.deleteByNodeId(nodeId);
    await this.flowNodeRepository.clearNextNodeReferences(nodeId);
    await this.nodeOptionRepository.clearNextNodeReferences(nodeId);

    // Se era o startNode do flow, limpar referência
    if (flow.startNodeId === nodeId) {
      flow.updateStartNode(null);
      await this.flowRepository.update(flow);
    }

    node.delete();
    await this.flowNodeRepository.save(node);
  }
}
