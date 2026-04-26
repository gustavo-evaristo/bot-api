import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetAnalyticsUseCase } from 'src/domain/use-cases/analytics/get-analytics.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
import { GetAnalyticsQueryDto } from 'src/infra/dtos/analytics/get-analytics.dto';
import { GetAnalyticsResponse } from 'src/infra/responses/analytics/get-analytics.response';

@ApiTags('Analytics')
@Controller('analytics')
export class GetAnalyticsController {
  constructor(private readonly getAnalyticsUseCase: GetAnalyticsUseCase) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for the authenticated user' })
  @ApiOkResponse({ type: GetAnalyticsResponse })
  async getAnalytics(
    @Req() { user }: IReq,
    @Query() query: GetAnalyticsQueryDto,
  ) {
    return this.getAnalyticsUseCase.execute({
      userId: user.id,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }
}
