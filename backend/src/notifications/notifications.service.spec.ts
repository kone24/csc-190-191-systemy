import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
    let service: NotificationsService;

    beforeEach(() => {
        service = new NotificationsService();
    });

    // =========================================================================
    // createDashboardAlert()
    // =========================================================================

    describe('createDashboardAlert()', () => {
        it('generates a unique id', () => {
            const n = service.createDashboardAlert({
                userId: 'u1', clientId: 'c1', interactionId: 'i1',
                title: 'T', body: 'B',
            });
            expect(n.id).toBeDefined();
            expect(typeof n.id).toBe('string');
            expect(n.id.length).toBeGreaterThan(0);
        });

        it('sets isRead to false', () => {
            const n = service.createDashboardAlert({
                userId: 'u1', clientId: 'c1', interactionId: 'i1',
                title: 'T', body: 'B',
            });
            expect(n.isRead).toBe(false);
        });

        it('sets createdAt to an ISO string', () => {
            const before = new Date().toISOString();
            const n = service.createDashboardAlert({
                userId: 'u1', clientId: 'c1', interactionId: 'i1',
                title: 'T', body: 'B',
            });
            const after = new Date().toISOString();
            expect(n.createdAt >= before).toBe(true);
            expect(n.createdAt <= after).toBe(true);
        });

        it('stores the provided fields', () => {
            const n = service.createDashboardAlert({
                userId: 'user-99', clientId: 'client-99', interactionId: 'int-99',
                title: 'My Title', body: 'My Body',
            });
            expect(n.userId).toBe('user-99');
            expect(n.clientId).toBe('client-99');
            expect(n.interactionId).toBe('int-99');
            expect(n.title).toBe('My Title');
            expect(n.body).toBe('My Body');
        });

        it('generates unique ids for different alerts', () => {
            const n1 = service.createDashboardAlert({
                userId: 'u1', clientId: 'c1', interactionId: 'i1', title: 'T', body: 'B',
            });
            const n2 = service.createDashboardAlert({
                userId: 'u1', clientId: 'c1', interactionId: 'i1', title: 'T', body: 'B',
            });
            expect(n1.id).not.toBe(n2.id);
        });
    });

    // =========================================================================
    // listForUser()
    // =========================================================================

    describe('listForUser()', () => {
        it('returns only notifications for the given userId', () => {
            service.createDashboardAlert({ userId: 'u1', clientId: 'c1', interactionId: 'i1', title: 'A', body: 'B' });
            service.createDashboardAlert({ userId: 'u2', clientId: 'c2', interactionId: 'i2', title: 'C', body: 'D' });
            service.createDashboardAlert({ userId: 'u1', clientId: 'c3', interactionId: 'i3', title: 'E', body: 'F' });

            const result = service.listForUser('u1');
            expect(result).toHaveLength(2);
            expect(result.every(n => n.userId === 'u1')).toBe(true);
        });

        it('returns empty array for unknown userId', () => {
            service.createDashboardAlert({ userId: 'u1', clientId: 'c1', interactionId: 'i1', title: 'A', body: 'B' });
            expect(service.listForUser('unknown')).toEqual([]);
        });

        it('returns empty array when no notifications exist', () => {
            expect(service.listForUser('u1')).toEqual([]);
        });
    });
});
