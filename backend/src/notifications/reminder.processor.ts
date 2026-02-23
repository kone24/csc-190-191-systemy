import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { buildFollowUpTemplate } from './templates/followup.template';

@Injectable()
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(
    private readonly reminders: RemindersService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
  ) {}

  // runs every minute
  // @Cron('*/60 * * * * *')  // USE THIS AFTER TESTING
  @Cron('*/10 * * * * *') // every 10 seconds FOR TESTING
  async handleDueReminders() {
    const due = this.reminders.listDue(new Date());
    this.logger.log(`ReminderProcessor tick: due=${due.length}`);
    if (due.length === 0) return;

    for (const reminder of due) {
      try {
        this.reminders.markSending(reminder.id);

        // TODO: fetch real client + interaction details from existing services
        // Placeholder values for testing:
        const template = buildFollowUpTemplate({
          clientName: `Client ${reminder.clientId}`,
          clientId: reminder.clientId,
          interactionId: reminder.interactionId,
          interactionDate: reminder.baseTimeISO,
          interactionType: 'Meeting',
          notesPreview: undefined,
          dueAt: reminder.dueAt,
          followUpDays: reminder.followUpDays,
        });

        if (reminder.sendDashboard) {
          this.notifications.createDashboardAlert({
            userId: reminder.userId,
            clientId: reminder.clientId,
            interactionId: reminder.interactionId,
            title: template.title,
            body: template.body,
          });
        }

        if (reminder.sendEmail) {
          // TODO: look up user email properly
          const to = process.env.TEST_TO_EMAIL ?? 'test@example.com';
          await this.email.sendEmail(to, template.emailSubject, template.emailText);
        }

        this.reminders.markSent(reminder.id);
      } catch (err) {
        this.logger.error(`Reminder failed ${reminder.id}`, err as any);
        this.reminders.markFailed(reminder.id, err);
      }
    }
  }
}