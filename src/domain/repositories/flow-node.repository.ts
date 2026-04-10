import { FlowNodeEntity } from '../entities/flow-node.entity';

export abstract class IFlowNodeRepository {
  abstract get(id: string): Promise<FlowNodeEntity | null>;
  abstract create(node: FlowNodeEntity): Promise<void>;
  abstract save(node: FlowNodeEntity): Promise<void>;
  abstract createMany(nodes: FlowNodeEntity[]): Promise<void>;
  abstract deleteByKanbanId(kanbanId: string): Promise<void>;
  abstract clearNextNodeReferences(deletedNodeId: string): Promise<void>;
}
