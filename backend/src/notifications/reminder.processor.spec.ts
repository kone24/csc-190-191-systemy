import { ReminderProcessor } from './reminder.processor';
import { RemindersService } from '../reminders/reminders.service';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';

describe('ReminderProcessor', () => {
    let processor: ReminderProcessor;
    let reminders: jest.Mocked<RemindersService>;
    let notifications: jest.Mocked<NotificationsService>;
    let email: jest.Mocked<EmailService>;

    const dueReminder = {
        id: 'r1',
        assigned_to: 'user-1',
        client_id: 'client-1',
        interaction_id: 'int-1',
        remind_at: '2026-01-10T10:00:00Z',
        banner_shown: false,
        send_email: true,
        email_sent: false,
        days_after_interaction: 7,
    };

    beforeEach(() => {
        reminders = {
            listDue: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
            markFailed: jest.fn().mockResolvedValue({}),
        } as unknown as jest.Mocked<RemindersService>;

        notifications = {
            createDashboardAlert: jest.fn().mockReturnValue({ id: 'notif-1' }),
        } as unknown as jest.Mocked<NotificationsService>;

        email = {
            sendEmail: jest.fn().mockResolvedValue(undefined),
            getRecipientEmailForUser: jest.fn(),
        } as unknown as jest.Mocked<EmailService>;

        processor = new ReminderProcessor(reminders, notifications, email);
    });

    // =========================================================================
    // No due reminders
    // =========================================================================

    it('does nothing when no due reminders', async () => {
        reminders.listDue.mockResolvedValue([]);
        await processor.handleDueReminders();
        expect(notifications.createDashboardAlert).not.toHaveBeenCalled();
        expect(email.sendEmail).not.toHaveBeenCalled();
    });

    // =========================================================================
    // Dashboard alert
    // =========================================================================

    it('creates dashboard alert when banner_shown === false', async () => {
        reminders.listDue.mockResolvedValue([dueReminder as any]);
        email.getRecipientEmailForUser.mockResolvedValue('user@example.com');

        await processor.handleDueReminders();

        expect(notifications.createDashboardAlert).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-1', clientId: 'client-1' }),
        );
    });

    it('does NOT create dashboard alert when banner_shown === true', async () => {
        reminders.listDue.mockResolvedValue([{ ...dueReminder, banner_shown: true } as any]);
        email.getRecipientEmailForUser.mockResolvedValue(null);

        await processor.handleDueReminders();

        expect(notifications.createDashboardAlert).not.toHaveBeenCalled();
    });

    // =========================================================================
    // Email path
    // =========================================================================

    it('sends email when send_email=true and email_sent=false', async () => {
        reminders.listDue.mockResolvedValue([dueReminder as any]);
        email.getRecipientEmailForUser.mockResolvedValue('user@example.com');

        await processor.handleDueReminders();

        expect(email.getRecipientEmailForUser).toHaveBeenCalledWith('user-1');
        expect(email.sendEmail).toHaveBeenCalledWith(
            'user@example.com',
            expect.any(String),
            expect.any(String),
        );
    });

    it('does NOT send email when send_email=false', async () => {
        reminders.listDue.mockResolvedValue([{ ...dueReminder, send_email: false } as any]);

        await processor.handleDueReminders();

        expect(email.sendEmail).not.toHaveBeenCalled();
    });

    it('does NOT send email when email_sent=true', async () => {
        reminders.listDue.mockResolvedValue([{ ...dueReminder, email_sent: true } as any]);

        await processor.handleDueReminders();

        expect(email.sendEmail).not.toHaveBeenCalled();
    });

    it('marks email_sent=true after successful send', async () => {
        reminders.listDue.mockResolvedValue([dueReminder as any]);
        email.getRecipientEmailForUser.mockResolvedValue('user@example.com');

        await processor.handleDueReminders();

        expect(reminders.update).toHaveBeenCalledWith('r1', { email_sent: true });
    });

    // =========================================================================
    // Error handling
    // =========================================================================

    it('calls markFailed when an error occurs processing a reminder', async () => {
        reminders.listDue.mockResolvedValue([dueReminder as any]);
        email.getRecipientEmailForUser.mockRejectedValue(new Error('lookup failed'));

        await processor.handleDueReminders();

        expect(reminders.markFailed).toHaveBeenCalledWith('r1', expect.any(Error));
    });

    it('calls markFailed when no email found for user', async () => {
        reminders.listDue.mockResolvedValue([dueReminder as any]);
        email.getRecipientEmailForUser.mockResolvedValue(null);

        await processor.handleDueReminders();

        expect(reminders.markFailed).toHaveBeenCalledWith('r1', expect.any(Error));
    });
});
