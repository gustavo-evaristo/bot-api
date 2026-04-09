import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetAnalyticsUseCase } from 'src/domain/use-cases/analytics/get-analytics.use-case';
import { JwtGuard } from 'src/infra/authentication/jwt.guard';
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
  async getAnalytics(@Req() { user }: IReq) {
    return this.getAnalyticsUseCase.execute({ userId: user.id });
  }
}
