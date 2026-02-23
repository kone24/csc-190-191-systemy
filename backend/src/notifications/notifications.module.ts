import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { RemindersService } from './reminders.service';
import { ReminderProcessor } from './reminder.processor';
import { RemindersController } from './reminders.controller';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [RemindersController, NotificationsController],
  providers: [NotificationsService, EmailService, RemindersService, ReminderProcessor],
  exports: [RemindersService, NotificationsService],
})
export class NotificationsModule {}