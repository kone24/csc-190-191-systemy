import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { IsOptional, IsString } from 'class-validator';

class ListNotificationsQuery {
  @IsOptional()
  @IsString()
  userId?: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Query() q: ListNotificationsQuery) {
    if (!q.userId) return { notifications: [] };
    return { notifications: this.notifications.listForUser(q.userId) };
  }
}