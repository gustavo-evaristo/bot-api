import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FlowEntity } from 'src/domain/entities/flow.entity';
import { FlowNodeEntity, NodeType } from 'src/domain/entities/flow-node.entity';
import { NodeOptionEntity } from 'src/domain/entities/node-option.entity';
import { UUID } from 'src/domain/entities/vos';
import {
  IFlowRepository,
  IUserRepository,
  IFlowNodeRepository,
  INodeOptionRepository,
} from 'src/domain/repositories';

interface Input {
  flowId: string;
  userId: string;
}

@Injectable()
export class DuplicateFlowUseCase {
  constructor(
    private readonly flowRepository: IFlowRepository,
    private readonly userRepository: IUserRepository,
    private readonly flowNodeRepository?: IFlowNodeRepository,
    private readonly nodeOptionRepository?: INodeOptionRepository,
  ) {}

  async execute({ flowId, userId }: Input): Promise<FlowEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const flow = await this.flowRepository.get(flowId);

    if (!flow) {
      throw new Error('Flow not found');
    }

    if (!flow.belongsTo(user.id)) {
      throw new Error('User is not the owner of the flow');
    }

    const duplicatedFlow = flow.duplicate();

    if (this.flowNodeRepository && this.nodeOptionRepository) {
      const details = await this.flowRepository.getDetails(flowId);

      if (details && details.nodes.length > 0) {
        const idMap = new Map<string, string>();
        for (const node of details.nodes) {
          idMap.set(node.id, randomUUID());
        }

        const newNodes = details.nodes.map((node) => {
          const newId = idMap.get(node.id)!;
          const newDefaultNext = node.defaultNextNodeId
            ? (idMap.get(node.defaultNextNodeId) ?? null)
            : null;

          return new FlowNodeEntity({
            id: UUID.from(newId),
            flowId: duplicatedFlow.id,
            type: node.type as NodeType,
            content: node.content,
            defaultNextNodeId: newDefaultNext,
            x: node.x,
            y: node.y,
          });
        });

        const newOptions: NodeOptionEntity[] = [];
        for (const node of details.nodes) {
          for (const opt of node.options) {
            const newNodeId = idMap.get(node.id)!;
            const newNextNodeId = opt.nextNodeId
              ? (idMap.get(opt.nextNodeId) ?? null)
              : null;

            newOptions.push(
              new NodeOptionEntity({
                nodeId: UUID.from(newNodeId),
                content: opt.content,
                score: opt.score,
                order: opt.order,
                nextNodeId: newNextNodeId,
              }),
            );
          }
        }

        if (details.startNodeId) {
          const newStartNodeId = idMap.get(details.startNodeId) ?? null;
          duplicatedFlow.updateStartNode(newStartNodeId);
        }

        await this.flowRepository.create(duplicatedFlow);
        await this.flowNodeRepository.createMany(newNodes);
        if (newOptions.length > 0) {
          await this.nodeOptionRepository.createMany(newOptions);
        }

        return flow;
      }
    }

    await this.flowRepository.create(duplicatedFlow);

    return flow;
  }
}
