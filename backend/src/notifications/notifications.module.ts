import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PreferencesService } from './preferences.service';
import { EmailService } from './email.service';
import { RemindersService } from './reminders.service';
import { ReminderProcessor } from './reminder.processor';
import { RemindersController } from './reminders.controller';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [RemindersController, NotificationsController],
  providers: [NotificationsService, PreferencesService, EmailService, RemindersService, ReminderProcessor],
  exports: [RemindersService, NotificationsService, PreferencesService, EmailService],
})
export class NotificationsModule { }