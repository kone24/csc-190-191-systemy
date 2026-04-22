import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Req() req: Request) {
    const payload = req['user'] as { username?: string };
    const email = payload?.username ?? '';
    return this.activityService.getFeed(email);
  }
}
