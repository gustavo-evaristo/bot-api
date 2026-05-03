import { FlowDetails, FlowEntity } from '../entities/flow.entity';

export interface FlowListItem {
  id: string;
  isActive: boolean;
  title: string;
  description: string | null;
  phoneNumber: string | null;
  kanbanId: string | null;
  kanbanTitle: string | null;
  leadsCount: number;
  messagesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class IFlowRepository {
  abstract create(flow: FlowEntity): Promise<void>;
  abstract get(id: string): Promise<FlowEntity | null>;
  abstract update(flow: FlowEntity): Promise<void>;
  abstract findManyByUserId(userId): Promise<FlowEntity[]>;
  abstract findManyByUserIdWithStats(userId: string): Promise<FlowListItem[]>;
  abstract getDetails(id: string): Promise<FlowDetails | null>;
  abstract findByPhoneNumber(phoneNumber: string): Promise<FlowEntity | null>;
  /**
   * Ativa todos os fluxos do usuário que estão pendentes (isActive=false)
   * com o phoneNumber informado. Disparado após o WhatsApp conectar para
   * o número cadastrado durante a criação do fluxo.
   * Retorna a quantidade de fluxos ativados.
   */
  abstract activatePendingByUserAndPhone(
    userId: string,
    phoneNumber: string,
  ): Promise<number>;
  /**
   * Deep-copy a flow with all nodes and options. Returns the new flow id.
   * The copy starts inactive, with no phone number, and the title gets a
   * "(cópia)" suffix.
   */
  abstract duplicate(flowId: string, userId: string): Promise<string>;
}
