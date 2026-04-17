import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PreferencesService } from './preferences.service';
import { EmailService } from './email.service';
import { ReminderProcessor } from './reminder.processor';
import { NotificationsController } from './notifications.controller';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [RemindersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PreferencesService, EmailService, ReminderProcessor],
  exports: [NotificationsService, PreferencesService, EmailService],
})
export class NotificationsModule { }