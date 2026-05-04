import { CompanyEntity } from '../entities/company.entity';

export abstract class ICompanyRepository {
  abstract get(id: string): Promise<CompanyEntity | null>;
  abstract create(company: CompanyEntity): Promise<void>;
  abstract update(company: CompanyEntity): Promise<void>;
}
