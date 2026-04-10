import { NodeOptionEntity } from '../entities/node-option.entity';

export abstract class INodeOptionRepository {
  abstract createMany(options: NodeOptionEntity[]): Promise<void>;
  abstract deleteByNodeId(nodeId: string): Promise<void>;
  abstract deleteByKanbanId(kanbanId: string): Promise<void>;
  abstract clearNextNodeReferences(deletedNodeId: string): Promise<void>;
}
