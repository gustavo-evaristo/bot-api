import { UUID } from './vos';

interface KanbanEntityProps {
  id?: string | UUID | null;
  isActive?: boolean | null;
  isDeleted?: boolean | null;
  userId: string | UUID;
  title: string;
  description: string;
  imageUrl?: string | null;
  phoneNumber?: string | null;
  startNodeId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface UpdateKanbanEntityProps {
  title: string;
  description: string;
  imageUrl: string | null;
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

export interface KanbanDetails {
  id: string;
  title: string;
  description: string;
  userId: string;
  startNodeId: string | null;
  nodes: FlowNodeDetail[];
}

export class KanbanEntity {
  id: UUID;
  userId: UUID;
  isActive: boolean;
  isDeleted: boolean;
  title: string;
  description: string;
  imageUrl: string | null;
  phoneNumber: string | null;
  startNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: KanbanEntityProps) {
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
    this.description = props.description;
    this.imageUrl = props.imageUrl ?? null;
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
      throw new Error('Phone number is required to activate the kanban');
    }

    if (!this.startNodeId) {
      throw new Error('A start node is required to activate the kanban');
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

  update({ title, description, imageUrl }: UpdateKanbanEntityProps) {
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;

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

  duplicate(): KanbanEntity {
    return new KanbanEntity({
      userId: this.userId,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      isActive: false,
      isDeleted: false,
      phoneNumber: null,
      startNodeId: null,
    });
  }
}
