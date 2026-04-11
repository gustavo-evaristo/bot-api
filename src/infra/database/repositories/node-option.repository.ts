import { Injectable } from '@nestjs/common';
import { INodeOptionRepository } from 'src/domain/repositories/node-option.repository';
import { NodeOptionEntity } from 'src/domain/entities/node-option.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NodeOptionRepository implements INodeOptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createMany(options: NodeOptionEntity[]): Promise<void> {
    await this.prismaService.node_options.createMany({
      data: options.map((opt) => ({
        id: opt.id.toString(),
        nodeId: opt.nodeId.toString(),
        isDeleted: opt.isDeleted,
        content: opt.content,
        score: opt.score,
        order: opt.order,
        nextNodeId: opt.nextNodeId,
        createdAt: opt.createdAt,
        updatedAt: opt.updatedAt,
      })),
    });
  }

  async deleteByNodeId(nodeId: string): Promise<void> {
    await this.prismaService.node_options.updateMany({
      where: { nodeId },
      data: { isDeleted: true },
    });
  }

  async deleteByFlowId(flowId: string): Promise<void> {
    await this.prismaService.node_options.updateMany({
      where: { node: { flowId } },
      data: { isDeleted: true },
    });
  }

  async clearNextNodeReferences(deletedNodeId: string): Promise<void> {
    await this.prismaService.node_options.updateMany({
      where: { nextNodeId: deletedNodeId },
      data: { nextNodeId: null },
    });
  }
}
