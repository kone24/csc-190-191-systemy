import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async getSummary(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getSummary(query.range);
    return { ok: true, data };
  }

  @Get('revenue-by-month')
  async getRevenueByMonth(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getRevenueByMonth(query.range);
    return { ok: true, data };
  }

  @Get('client-growth')
  async getClientGrowth(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getClientGrowth(query.range);
    return { ok: true, data };
  }

  @Get('invoice-status')
  async getInvoiceStatus(@Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getInvoiceStatus(query.range);
    return { ok: true, data };
  }
}
