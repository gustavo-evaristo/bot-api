import { Injectable } from '@nestjs/common';
import { FlowNodeEntity, NodeType } from 'src/domain/entities/flow-node.entity';
import { NodeOptionEntity } from 'src/domain/entities/node-option.entity';
import { IFlowNodeRepository } from 'src/domain/repositories/flow-node.repository';
import { INodeOptionRepository } from 'src/domain/repositories/node-option.repository';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

interface NodeOptionInput {
  content: string;
  score?: number;
  order?: number;
  nextNodeId?: string | null;
}

interface Input {
  userId: string;
  kanbanId: string;
  type: NodeType;
  content: string;
  defaultNextNodeId?: string | null;
  x?: number;
  y?: number;
  options?: NodeOptionInput[];
}

@Injectable()
export class CreateNodeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly kanbanRepository: IKanbanRepository,
    private readonly flowNodeRepository: IFlowNodeRepository,
    private readonly nodeOptionRepository: INodeOptionRepository,
  ) {}

  async execute({
    userId,
    kanbanId,
    type,
    content,
    defaultNextNodeId,
    x,
    y,
    options,
  }: Input): Promise<FlowNodeEntity> {
    const user = await this.userRepository.get(userId);
    if (!user) throw new Error('User not found');

    const kanban = await this.kanbanRepository.get(kanbanId);
    if (!kanban) throw new Error('Kanban not found');

    if (!kanban.belongsTo(user.id)) {
      throw new Error('User does not own this kanban');
    }

    const node = new FlowNodeEntity({
      kanbanId,
      type,
      content,
      defaultNextNodeId: defaultNextNodeId ?? null,
      x: x ?? 0,
      y: y ?? 0,
    });

    await this.flowNodeRepository.create(node);

    if (
      type === NodeType.QUESTION_MULTIPLE_CHOICE &&
      options &&
      options.length > 0
    ) {
      const nodeOptions = options.map(
        (opt, i) =>
          new NodeOptionEntity({
            nodeId: node.id,
            content: opt.content,
            score: opt.score ?? 0,
            order: opt.order ?? i,
            nextNodeId: opt.nextNodeId ?? null,
          }),
      );

      await this.nodeOptionRepository.createMany(nodeOptions);
    }

    return node;
  }
}
