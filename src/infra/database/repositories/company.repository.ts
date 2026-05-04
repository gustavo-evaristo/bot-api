import { Injectable } from '@nestjs/common';
import { CompanyEntity } from 'src/domain/entities/company.entity';
import { UUID } from 'src/domain/entities/vos';
import { ICompanyRepository } from 'src/domain/repositories/company.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async get(id: string): Promise<CompanyEntity | null> {
    const row = await this.prismaService.companies.findUnique({
      where: { id, isDeleted: false },
    });
    if (!row) return null;
    return new CompanyEntity({ ...row, id: UUID.from(row.id) });
  }

  async create(company: CompanyEntity): Promise<void> {
    await this.prismaService.companies.create({
      data: {
        id: company.id.toString(),
        name: company.name,
        isDeleted: company.isDeleted,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  }

  async update(company: CompanyEntity): Promise<void> {
    await this.prismaService.companies.update({
      where: { id: company.id.toString() },
      data: {
        name: company.name,
        isDeleted: company.isDeleted,
        updatedAt: company.updatedAt,
      },
    });
  }
}
