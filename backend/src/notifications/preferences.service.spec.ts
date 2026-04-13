import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesService, NotificationPreferences } from './preferences.service';

describe('PreferencesService', () => {
    let service: PreferencesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PreferencesService],
        }).compile();

        service = module.get<PreferencesService>(PreferencesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // =========================================================================
    // get()
    // =========================================================================
    describe('get()', () => {
        it('returns defaults when no preferences have been set', () => {
            const prefs = service.get('user-1');

            expect(prefs).toEqual({
                userId: 'user-1',
                followUpEnabled: true,
                channels: { email: true, dashboard: true },
            });
        });

        it('returns defaults for different user IDs', () => {
            const a = service.get('user-a');
            const b = service.get('user-b');

            expect(a.userId).toBe('user-a');
            expect(b.userId).toBe('user-b');
            expect(a.followUpEnabled).toBe(true);
            expect(b.followUpEnabled).toBe(true);
        });

        it('returns stored preferences after set()', () => {
            service.set('user-1', { followUpEnabled: false });

            const prefs = service.get('user-1');

            expect(prefs.followUpEnabled).toBe(false);
            expect(prefs.channels.email).toBe(true);
            expect(prefs.channels.dashboard).toBe(true);
        });
    });

    // =========================================================================
    // set()
    // =========================================================================
    describe('set()', () => {
        it('updates followUpEnabled while preserving channels', () => {
            const result = service.set('user-1', { followUpEnabled: false });

            expect(result.followUpEnabled).toBe(false);
            expect(result.channels).toEqual({ email: true, dashboard: true });
        });

        it('updates a single channel while preserving the other', () => {
            const result = service.set('user-1', { channels: { email: false } });

            expect(result.channels.email).toBe(false);
            expect(result.channels.dashboard).toBe(true);
        });

        it('updates dashboard channel independently', () => {
            const result = service.set('user-1', { channels: { dashboard: false } });

            expect(result.channels.dashboard).toBe(false);
            expect(result.channels.email).toBe(true);
        });

        it('updates both channels at once', () => {
            const result = service.set('user-1', {
                channels: { email: false, dashboard: false },
            });

            expect(result.channels).toEqual({ email: false, dashboard: false });
        });

        it('updates everything at once', () => {
            const result = service.set('user-1', {
                followUpEnabled: false,
                channels: { email: false, dashboard: false },
            });

            expect(result).toEqual({
                userId: 'user-1',
                followUpEnabled: false,
                channels: { email: false, dashboard: false },
            });
        });

        it('applies updates incrementally across multiple set() calls', () => {
            service.set('user-1', { followUpEnabled: false });
            service.set('user-1', { channels: { email: false } });

            const prefs = service.get('user-1');

            expect(prefs.followUpEnabled).toBe(false);
            expect(prefs.channels.email).toBe(false);
            expect(prefs.channels.dashboard).toBe(true);
        });

        it('keeps preferences isolated between users', () => {
            service.set('user-a', { followUpEnabled: false });
            service.set('user-b', { channels: { dashboard: false } });

            const a = service.get('user-a');
            const b = service.get('user-b');

            expect(a.followUpEnabled).toBe(false);
            expect(a.channels.dashboard).toBe(true);
            expect(b.followUpEnabled).toBe(true);
            expect(b.channels.dashboard).toBe(false);
        });

        it('returns the merged result', () => {
            const result = service.set('user-1', { channels: { email: false } });

            expect(result.userId).toBe('user-1');
            expect(result.followUpEnabled).toBe(true);
            expect(result.channels.email).toBe(false);
            expect(result.channels.dashboard).toBe(true);
        });
    });
});
