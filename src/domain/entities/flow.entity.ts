import { UUID } from './vos';

interface FlowEntityProps {
  id?: string | UUID | null;
  isActive?: boolean | null;
  isDeleted?: boolean | null;
  userId: string | UUID;
  kanbanId?: string | null;
  title: string;
  description?: string | null;
  phoneNumber?: string | null;
  startNodeId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface UpdateFlowEntityProps {
  title: string;
  description?: string | null;
  kanbanId?: string | null;
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
  kanbanStageId: string | null;
  postFillKanbanStageId: string | null;
  formId: string | null;
  x: number;
  y: number;
  options: NodeOptionDetail[];
}

export interface FlowDetails {
  id: string;
  title: string;
  userId: string;
  isActive: boolean;
  phoneNumber: string | null;
  kanbanId: string | null;
  kanbanTitle: string | null;
  startNodeId: string | null;
  /** Status atual da sessão WhatsApp do usuário ('CONNECTED' / 'PENDING' / 'DISCONNECTED'). */
  whatsappStatus: string | null;
  /** Número efetivamente pareado no WhatsApp (pode diferir do phoneNumber do fluxo). */
  whatsappConnectedPhone: string | null;
  nodes: FlowNodeDetail[];
}

export class FlowEntity {
  id: UUID;
  userId: UUID;
  kanbanId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  title: string;
  description: string | null;
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

    this.kanbanId = props.kanbanId ?? null;
    this.isActive = props.isActive ?? false;
    this.isDeleted = props.isDeleted ?? false;
    this.title = props.title;
    this.description = props.description ?? null;
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

  update({ title, description, kanbanId }: UpdateFlowEntityProps) {
    this.title = title;
    this.description = description ?? null;
    this.kanbanId = kanbanId !== undefined ? (kanbanId ?? null) : this.kanbanId;
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
