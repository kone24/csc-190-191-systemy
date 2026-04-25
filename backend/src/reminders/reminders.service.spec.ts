import { RemindersService } from './reminders.service';
import { RemindersSupabaseService } from './reminders.supabase.service';
import * as util from './utils/reminder-date.util';

jest.mock('./utils/reminder-date.util', () => ({
    calculateRemindAt: jest.fn(() => '2026-05-01T00:00:00.000Z'),
}));

const mockSupabase = {
    createReminder: jest.fn(),
    getAllReminders: jest.fn(),
    getRemindersByClient: jest.fn(),
    updateReminder: jest.fn(),
} as unknown as jest.Mocked<RemindersSupabaseService>;

describe('RemindersService', () => {
    let service: RemindersService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new RemindersService(mockSupabase);
    });

    // =========================================================================
    // create()
    // =========================================================================

    describe('create()', () => {
        it('calls calculateRemindAt and passes result to createReminder', async () => {
            mockSupabase.createReminder.mockResolvedValue({ id: 'r1' });
            const dto: any = {
                title: 'Test Reminder',
                timezone: 'UTC',
                remind_at: '2026-05-01',
                interaction_date: '2026-04-25',
                days_after_interaction: 6,
            };
            await service.create(dto);
            expect(util.calculateRemindAt).toHaveBeenCalledWith('2026-04-25', 6, '2026-05-01');
            expect(mockSupabase.createReminder).toHaveBeenCalledWith(
                expect.objectContaining({ remind_at: '2026-05-01T00:00:00.000Z' }),
            );
        });

        it('passes all DTO fields with defaults to createReminder', async () => {
            mockSupabase.createReminder.mockResolvedValue({ id: 'r1' });
            const dto: any = { title: 'T', timezone: 'UTC' };
            await service.create(dto);
            expect(mockSupabase.createReminder).toHaveBeenCalledWith(
                expect.objectContaining({
                    client_id: null,
                    interaction_id: null,
                    title: 'T',
                    description: null,
                    timezone: 'UTC',
                    status: 'PENDING',
                    sync_to_google: false,
                    google_event_id: null,
                    admin_override: false,
                }),
            );
        });

        it('sets assigned_to when provided', async () => {
            mockSupabase.createReminder.mockResolvedValue({ id: 'r1' });
            await service.create({ title: 'T', timezone: 'UTC', assigned_to: 'user-1' } as any);
            expect(mockSupabase.createReminder).toHaveBeenCalledWith(
                expect.objectContaining({ assigned_to: 'user-1' }),
            );
        });
    });

    // =========================================================================
    // update()
    // =========================================================================

    describe('update()', () => {
        it('recalculates remind_at when remind_at is provided', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.update('r1', { remind_at: '2026-06-01' } as any);
            expect(util.calculateRemindAt).toHaveBeenCalled();
            expect(mockSupabase.updateReminder).toHaveBeenCalledWith(
                'r1',
                expect.objectContaining({ remind_at: '2026-05-01T00:00:00.000Z' }),
            );
        });

        it('recalculates remind_at when interaction_date is provided', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.update('r1', { interaction_date: '2026-04-01' } as any);
            expect(util.calculateRemindAt).toHaveBeenCalled();
        });

        it('recalculates remind_at when days_after_interaction is provided', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.update('r1', { days_after_interaction: 3 } as any);
            expect(util.calculateRemindAt).toHaveBeenCalled();
        });

        it('does NOT recalculate when no trigger fields provided', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.update('r1', { title: 'New Title' } as any);
            expect(util.calculateRemindAt).not.toHaveBeenCalled();
        });

        it('normalizes status to uppercase', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.update('r1', { status: 'completed' } as any);
            expect(mockSupabase.updateReminder).toHaveBeenCalledWith(
                'r1',
                expect.objectContaining({ status: 'COMPLETED' }),
            );
        });
    });

    // =========================================================================
    // getDueReminders()
    // =========================================================================

    describe('getDueReminders()', () => {
        it('returns only reminders where remind_at <= now AND banner_shown === false', async () => {
            const past = new Date(Date.now() - 60_000).toISOString();
            const future = new Date(Date.now() + 60_000).toISOString();
            mockSupabase.getAllReminders.mockResolvedValue([
                { id: '1', remind_at: past, banner_shown: false },
                { id: '2', remind_at: past, banner_shown: true },
                { id: '3', remind_at: future, banner_shown: false },
                { id: '4', remind_at: null, banner_shown: false },
            ]);
            const result = await service.getDueReminders();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('returns empty array when no reminders are due', async () => {
            const future = new Date(Date.now() + 60_000).toISOString();
            mockSupabase.getAllReminders.mockResolvedValue([
                { id: '1', remind_at: future, banner_shown: false },
            ]);
            const result = await service.getDueReminders();
            expect(result).toHaveLength(0);
        });
    });

    // =========================================================================
    // markFailed()
    // =========================================================================

    describe('markFailed()', () => {
        it('sets status=PENDING with the error message', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.markFailed('r1', new Error('something broke'));
            expect(mockSupabase.updateReminder).toHaveBeenCalledWith(
                'r1',
                expect.objectContaining({
                    status: 'PENDING',
                    last_error: 'something broke',
                }),
            );
        });

        it('converts non-Error objects to string', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.markFailed('r1', 'plain string error');
            expect(mockSupabase.updateReminder).toHaveBeenCalledWith(
                'r1',
                expect.objectContaining({ last_error: 'plain string error' }),
            );
        });
    });

    // =========================================================================
    // markCompleted()
    // =========================================================================

    describe('markCompleted()', () => {
        it('sets banner_shown=true and status=COMPLETED', async () => {
            mockSupabase.updateReminder.mockResolvedValue({});
            await service.markCompleted('r1');
            expect(mockSupabase.updateReminder).toHaveBeenCalledWith(
                'r1',
                expect.objectContaining({
                    banner_shown: true,
                    status: 'COMPLETED',
                }),
            );
        });
    });

    // =========================================================================
    // createFollowUpReminder()
    // =========================================================================

    describe('createFollowUpReminder()', () => {
        it('calculates due date as base + followUpDays', async () => {
            mockSupabase.createReminder.mockResolvedValue({ id: 'new-r' });
            const baseTimeISO = '2026-01-01T00:00:00.000Z';
            const followUpDays = 7;
            await service.createFollowUpReminder({
                userId: 'u1',
                clientId: 'c1',
                interactionId: 'i1',
                followUpDays,
                baseTimeISO,
                sendEmail: false,
                sendDashboard: true,
            });
            const expected = new Date(
                new Date(baseTimeISO).getTime() + followUpDays * 24 * 60 * 60 * 1000,
            ).toISOString();
            expect(mockSupabase.createReminder).toHaveBeenCalledWith(
                expect.objectContaining({ remind_at: expected }),
            );
        });

        it('passes sendEmail and defaults email_sent=false, banner_shown=false', async () => {
            mockSupabase.createReminder.mockResolvedValue({ id: 'r' });
            await service.createFollowUpReminder({
                userId: 'u1', clientId: 'c1', interactionId: 'i1',
                followUpDays: 3, baseTimeISO: '2026-01-01T00:00:00.000Z',
                sendEmail: true, sendDashboard: false,
            });
            expect(mockSupabase.createReminder).toHaveBeenCalledWith(
                expect.objectContaining({ send_email: true, email_sent: false, banner_shown: false }),
            );
        });
    });
});
