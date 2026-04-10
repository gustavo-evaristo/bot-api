import { UUID } from './vos';

type NodeOptionEntityProps = {
  id?: string | UUID | null;
  nodeId: string | UUID;
  isDeleted?: boolean | null;
  content: string;
  score?: number | null;
  order?: number | null;
  nextNodeId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export class NodeOptionEntity {
  id: UUID;
  nodeId: UUID;
  isDeleted: boolean;
  content: string;
  score: number;
  order: number;
  nextNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: NodeOptionEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.nodeId instanceof UUID) {
      this.nodeId = props.nodeId;
    } else {
      this.nodeId = UUID.from(props.nodeId);
    }

    this.isDeleted = props.isDeleted ?? false;
    this.content = props.content;
    this.score = props.score ?? 0;
    this.order = props.order ?? 0;
    this.nextNodeId = props.nextNodeId ?? null;

    const createdAt = props.createdAt || new Date();
    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }
}
