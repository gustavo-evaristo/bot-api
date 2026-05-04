import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetAnalyticsV2QueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  kanbanId?: string;

  @IsOptional()
  @IsUUID()
  flowId?: string;
}
