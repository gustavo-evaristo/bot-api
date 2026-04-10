import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { FlowNodeEntity, NodeType } from 'src/domain/entities/flow-node.entity';
import { NodeOptionEntity } from 'src/domain/entities/node-option.entity';
import { UUID } from 'src/domain/entities/vos';
import {
  IKanbanRepository,
  IUserRepository,
  IFlowNodeRepository,
  INodeOptionRepository,
} from 'src/domain/repositories';

interface Input {
  kanbanId: string;
  userId: string;
}

@Injectable()
export class DuplicateKanbanUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly userRepository: IUserRepository,
    private readonly flowNodeRepository?: IFlowNodeRepository,
    private readonly nodeOptionRepository?: INodeOptionRepository,
  ) {}

  async execute({ kanbanId, userId }: Input): Promise<KanbanEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanban = await this.kanbanRepository.get(kanbanId);

    if (!kanban) {
      throw new Error('Kanban not found');
    }

    if (!kanban.belongsTo(user.id)) {
      throw new Error('User is not the owner of the kanban');
    }

    const duplicatedKanban = kanban.duplicate();

    // Se tiver repositórios de nós, copiar estrutura de fluxo
    if (this.flowNodeRepository && this.nodeOptionRepository) {
      const details = await this.kanbanRepository.getDetails(kanbanId);

      if (details && details.nodes.length > 0) {
        // Mapear IDs antigos → novos
        const idMap = new Map<string, string>();
        for (const node of details.nodes) {
          idMap.set(node.id, randomUUID());
        }

        // Criar nós com novos IDs e edges re-mapeadas
        const newNodes = details.nodes.map((node) => {
          const newId = idMap.get(node.id)!;
          const newDefaultNext = node.defaultNextNodeId
            ? (idMap.get(node.defaultNextNodeId) ?? null)
            : null;

          return new FlowNodeEntity({
            id: UUID.from(newId),
            kanbanId: duplicatedKanban.id,
            type: node.type as NodeType,
            content: node.content,
            defaultNextNodeId: newDefaultNext,
            x: node.x,
            y: node.y,
          });
        });

        // Criar opções com novos IDs e edges re-mapeadas
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

        // Atualizar startNodeId no kanban duplicado
        if (details.startNodeId) {
          const newStartNodeId = idMap.get(details.startNodeId) ?? null;
          duplicatedKanban.updateStartNode(newStartNodeId);
        }

        await this.kanbanRepository.create(duplicatedKanban);
        await this.flowNodeRepository.createMany(newNodes);
        if (newOptions.length > 0) {
          await this.nodeOptionRepository.createMany(newOptions);
        }

        return kanban;
      }
    }

    await this.kanbanRepository.create(duplicatedKanban);

    return kanban;
  }
}
