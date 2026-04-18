import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PreferencesService } from './preferences.service';

describe('NotificationsController', () => {
    let controller: NotificationsController;
    let notificationsService: NotificationsService;
    let preferencesService: PreferencesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationsController],
            providers: [NotificationsService, PreferencesService],
        }).compile();

        controller = module.get<NotificationsController>(NotificationsController);
        notificationsService = module.get<NotificationsService>(NotificationsService);
        preferencesService = module.get<PreferencesService>(PreferencesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // =========================================================================
    // GET /notifications
    // =========================================================================
    describe('listForUser()', () => {
        it('returns empty array when userId is not provided', () => {
            const result = controller.listForUser(undefined as any);

            expect(result).toEqual([]);
        });

        it('returns notifications for a given userId', () => {
            notificationsService.createDashboardAlert({
            userId: 'user-1',
            clientId: 'c1',
            interactionId: 'i1',
            title: 'Follow up',
            body: 'Please follow up',
            });

            const result = controller.listForUser('user-1');

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Follow up');
        });

        it('returns empty array for a user with no notifications', () => {
            const result = controller.listForUser('user-no-notifs');

            expect(result).toEqual([]);
        });
        });

    // =========================================================================
    // GET /notifications/preferences/:userId
    // =========================================================================
    describe('getPreferences()', () => {
        it('returns default preferences for a new user', () => {
            const result = controller.getPreferences('user-1');

            expect(result).toEqual({
                ok: true,
                preferences: {
                    userId: 'user-1',
                    followUpEnabled: true,
                    channels: { email: true, dashboard: true },
                },
            });
        });

        it('returns updated preferences after a patch', () => {
            controller.updatePreferences('user-1', { followUpEnabled: false });

            const result = controller.getPreferences('user-1');

            expect(result.preferences.followUpEnabled).toBe(false);
            expect(result.preferences.channels.email).toBe(true);
        });
    });

    // =========================================================================
    // PATCH /notifications/preferences/:userId
    // =========================================================================
    describe('updatePreferences()', () => {
        it('updates followUpEnabled', () => {
            const result = controller.updatePreferences('user-1', { followUpEnabled: false });

            expect(result).toEqual({
                ok: true,
                preferences: {
                    userId: 'user-1',
                    followUpEnabled: false,
                    channels: { email: true, dashboard: true },
                },
            });
        });

        it('updates a single channel', () => {
            const result = controller.updatePreferences('user-1', {
                channels: { email: false },
            });

            expect(result.preferences.channels.email).toBe(false);
            expect(result.preferences.channels.dashboard).toBe(true);
        });

        it('updates everything at once', () => {
            const result = controller.updatePreferences('user-1', {
                followUpEnabled: false,
                channels: { email: false, dashboard: false },
            });

            expect(result.preferences).toEqual({
                userId: 'user-1',
                followUpEnabled: false,
                channels: { email: false, dashboard: false },
            });
        });

        it('preserves preferences across multiple updates', () => {
            controller.updatePreferences('user-1', { followUpEnabled: false });
            controller.updatePreferences('user-1', { channels: { dashboard: false } });

            const result = controller.getPreferences('user-1');

            expect(result.preferences.followUpEnabled).toBe(false);
            expect(result.preferences.channels.email).toBe(true);
            expect(result.preferences.channels.dashboard).toBe(false);
        });
    });
});
