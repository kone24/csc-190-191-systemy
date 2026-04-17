import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersService } from '../reminders/reminders.service';
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

  @Cron('*/10 * * * * *')
  async handleDueReminders() {
    const due = await this.reminders.listDue();
    this.logger.log(`ReminderProcessor tick: due=${due.length}`);
    if (due.length === 0) return;

    for (const reminder of due) {
      try {
        const userId = reminder.assigned_to;
        const clientId = reminder.client_id;
        const interactionId = reminder.interaction_id;

        const template = buildFollowUpTemplate({
          clientName: `Client ${clientId ?? 'unknown'}`,
          clientId,
          interactionId,
          interactionDate: reminder.remind_at,
          interactionType: 'Meeting',
          notesPreview: undefined,
          dueAt: reminder.remind_at,
          followUpDays: reminder.days_after_interaction ?? 0,
        });

        // Dashboard alert: create it, but DO NOT mark banner_shown here.
        // The banner should stay visible until the user clicks "Mark complete".
        if (reminder.banner_shown === false) {
          await this.notifications.createDashboardAlert({
            userId,
            clientId,
            interactionId,
            title: template.title,
            body: template.body,
          });
        }

        // Email path only
        if (reminder.send_email && !reminder.email_sent && userId) {
          const to = await this.email.getRecipientEmailForUser(userId);

          if (!to) {
            throw new Error(`No email found for user ${userId}`);
          }

          await this.email.sendEmail(to, template.emailSubject, template.emailText);
          this.logger.log(`Email sent for reminder ${reminder.id} to ${to}`);

          await this.reminders.update(reminder.id, {
            email_sent: true,
          });
        }

        // IMPORTANT:
        // Do NOT call markCompleted() here.
        // Let the dashboard button /reminders/:id/complete do that.
      } catch (err) {
        this.logger.error(`Reminder failed ${reminder.id}`, err as any);
        await this.reminders.markFailed(reminder.id, err);
      }
    }
  }
}