import { Controller, Get, Patch, Body, Query, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PreferencesService } from './preferences.service';
import { IsOptional, IsString } from 'class-validator';

class ListNotificationsQuery {
  @IsOptional()
  @IsString()
  userId?: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly preferences: PreferencesService,
  ) { }

  @Get()
  listForUser(@Query('userId') userId: string) {
    return this.notifications.listForUser(userId);
  }

  @Get('preferences/:userId')
  getPreferences(@Param('userId') userId: string) {
    return { ok: true, preferences: this.preferences.get(userId) };
  }

  @Patch('preferences/:userId')
  updatePreferences(
    @Param('userId') userId: string,
    @Body() body: { followUpEnabled?: boolean; channels?: { email?: boolean; dashboard?: boolean } },
  ) {
    const updated = this.preferences.set(userId, body);
    return { ok: true, preferences: updated };
  }
}