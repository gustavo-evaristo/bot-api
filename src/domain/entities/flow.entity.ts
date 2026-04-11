import { UUID } from './vos';

interface FlowEntityProps {
  id?: string | UUID | null;
  isActive?: boolean | null;
  isDeleted?: boolean | null;
  userId: string | UUID;
  title: string;
  phoneNumber?: string | null;
  startNodeId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface UpdateFlowEntityProps {
  title: string;
}

export interface NodeOptionDetail {
  id: string;
  content: string;
  score: number;
  order: number;
  nextNodeId: string | null;
}

export interface FlowNodeDetail {
  id: string;
  type: string;
  content: string;
  defaultNextNodeId: string | null;
  x: number;
  y: number;
  options: NodeOptionDetail[];
}

export interface FlowDetails {
  id: string;
  title: string;
  userId: string;
  startNodeId: string | null;
  nodes: FlowNodeDetail[];
}

export class FlowEntity {
  id: UUID;
  userId: UUID;
  isActive: boolean;
  isDeleted: boolean;
  title: string;
  phoneNumber: string | null;
  startNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: FlowEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    if (props.userId instanceof UUID) {
      this.userId = props.userId;
    } else {
      this.userId = UUID.from(props.userId);
    }

    this.isActive = props.isActive ?? false;
    this.isDeleted = props.isDeleted ?? false;
    this.title = props.title;
    this.phoneNumber = props.phoneNumber ?? null;
    this.startNodeId = props.startNodeId ?? null;

    const createdAt = props.createdAt || new Date();

    this.createdAt = createdAt;
    this.updatedAt = props.updatedAt || createdAt;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  active() {
    if (!this.phoneNumber) {
      throw new Error('Phone number is required to activate the flow');
    }

    if (!this.startNodeId) {
      throw new Error('A start node is required to activate the flow');
    }

    this.isActive = true;
    this.touch();
  }

  inactive() {
    this.isActive = false;
    this.touch();
  }

  belongsTo(userId: UUID): boolean {
    return this.userId.equals(userId);
  }

  update({ title }: UpdateFlowEntityProps) {
    this.title = title;
    this.touch();
  }

  updatePhoneNumber(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
    this.touch();
  }

  updateStartNode(startNodeId: string | null) {
    this.startNodeId = startNodeId;
    this.touch();
  }

  delete() {
    this.isDeleted = true;
    this.isActive = false;
    this.touch();
  }

  duplicate(): FlowEntity {
    return new FlowEntity({
      userId: this.userId,
      title: this.title,
      isActive: false,
      isDeleted: false,
      phoneNumber: null,
      startNodeId: null,
    });
  }
}
