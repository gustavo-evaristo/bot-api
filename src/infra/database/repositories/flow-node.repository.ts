import { Injectable } from '@nestjs/common';
import { IFlowNodeRepository } from 'src/domain/repositories/flow-node.repository';
import { FlowNodeEntity, NodeType } from 'src/domain/entities/flow-node.entity';
import { UUID } from 'src/domain/entities/vos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FlowNodeRepository implements IFlowNodeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async get(id: string): Promise<FlowNodeEntity | null> {
    const node = await this.prismaService.flow_nodes.findUnique({
      where: { id, isDeleted: false },
    });

    if (!node) return null;

    return new FlowNodeEntity({
      ...node,
      id: UUID.from(node.id),
      flowId: UUID.from(node.flowId),
      type: node.type as NodeType,
    });
  }

  async create(node: FlowNodeEntity): Promise<void> {
    await this.prismaService.flow_nodes.create({
      data: {
        id: node.id.toString(),
        flowId: node.flowId.toString(),
        isDeleted: node.isDeleted,
        type: node.type,
        content: node.content,
        defaultNextNodeId: node.defaultNextNodeId,
        x: node.x,
        y: node.y,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      },
    });
  }

  async save(node: FlowNodeEntity): Promise<void> {
    await this.prismaService.flow_nodes.update({
      where: { id: node.id.toString() },
      data: {
        isDeleted: node.isDeleted,
        type: node.type,
        content: node.content,
        defaultNextNodeId: node.defaultNextNodeId,
        x: node.x,
        y: node.y,
        updatedAt: node.updatedAt,
      },
    });
  }

  async createMany(nodes: FlowNodeEntity[]): Promise<void> {
    await this.prismaService.flow_nodes.createMany({
      data: nodes.map((node) => ({
        id: node.id.toString(),
        flowId: node.flowId.toString(),
        isDeleted: node.isDeleted,
        type: node.type,
        content: node.content,
        defaultNextNodeId: node.defaultNextNodeId,
        x: node.x,
        y: node.y,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
      })),
    });
  }

  async deleteByFlowId(flowId: string): Promise<void> {
    await this.prismaService.flow_nodes.updateMany({
      where: { flowId },
      data: { isDeleted: true },
    });
  }

  async clearNextNodeReferences(deletedNodeId: string): Promise<void> {
    await this.prismaService.flow_nodes.updateMany({
      where: { defaultNextNodeId: deletedNodeId },
      data: { defaultNextNodeId: null },
    });
  }
}
