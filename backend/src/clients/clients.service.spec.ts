import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';

// ---------------------------------------------------------------------------
// Mock the fs helpers used internally by ClientsService
// ---------------------------------------------------------------------------

let mockClients: any[] = [];
let mockInteractions: any[] = [];
let mockTransactions: any[] = [];

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(async (filePath: string) => {
            if (String(filePath).includes('interactions')) return JSON.stringify(mockInteractions);
            if (String(filePath).includes('transactions')) return JSON.stringify(mockTransactions);
            return JSON.stringify(mockClients);
        }),
        writeFile: jest.fn().mockResolvedValue(undefined),
        mkdir: jest.fn().mockResolvedValue(undefined),
    },
}));

describe('ClientsService', () => {
    let service: ClientsService;

    const VALID_BODY = {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        phone_number: '5551234567',
        business_name: 'Acme Corp',
    };

    beforeEach(() => {
        mockClients = [];
        mockInteractions = [];
        mockTransactions = [];
        service = new ClientsService();
    });

    // =========================================================================
    // searchClients()
    // =========================================================================

    describe('searchClients()', () => {
        it('returns all sorted by created_at desc when query is empty', async () => {
            mockClients = [
                { id: '1', first_name: 'A', email: 'a@x.com', created_at: '2026-01-01' },
                { id: '2', first_name: 'B', email: 'b@x.com', created_at: '2026-02-01' },
            ];
            const result = await service.searchClients('');
            expect(result[0].id).toBe('2');
            expect(result[1].id).toBe('1');
        });

        it('filters by first_name case-insensitively', async () => {
            mockClients = [
                { id: '1', first_name: 'Alice', last_name: 'A', email: 'a@x.com', created_at: '2026-01-01' },
                { id: '2', first_name: 'Bob', last_name: 'B', email: 'b@x.com', created_at: '2026-01-01' },
            ];
            const result = await service.searchClients('alice');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('filters by email case-insensitively', async () => {
            mockClients = [
                { id: '1', first_name: 'A', email: 'TARGET@EXAMPLE.COM', created_at: '2026-01-01' },
                { id: '2', first_name: 'B', email: 'other@x.com', created_at: '2026-01-01' },
            ];
            const result = await service.searchClients('target@example.com');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('filters by tags', async () => {
            mockClients = [
                { id: '1', first_name: 'A', tags: ['vip', 'gold'], created_at: '2026-01-01' },
                { id: '2', first_name: 'B', tags: ['basic'], created_at: '2026-01-01' },
            ];
            const result = await service.searchClients('vip');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        it('returns empty array when no clients match', async () => {
            mockClients = [{ id: '1', first_name: 'Alice', email: 'a@x.com', created_at: '2026-01-01' }];
            const result = await service.searchClients('zzznomatch');
            expect(result).toEqual([]);
        });
    });

    // =========================================================================
    // createClient()
    // =========================================================================

    describe('createClient()', () => {
        it('throws ConflictException on missing required fields (no email)', async () => {
            await expect(
                service.createClient({ first_name: 'X', last_name: 'Y', phone_number: '123', business_name: 'B' } as any),
            ).rejects.toThrow(ConflictException);
        });

        it('throws ConflictException on duplicate email', async () => {
            mockClients = [{ id: 'existing', email: 'john@example.com' }];
            await expect(service.createClient(VALID_BODY)).rejects.toThrow(ConflictException);
        });

        it('generates a UUID id', async () => {
            const result = await service.createClient(VALID_BODY);
            expect(result.id).toBeDefined();
            expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
        });

        it('sets created_at and updated_at timestamps', async () => {
            const result = await service.createClient(VALID_BODY);
            expect(result.created_at).toBeDefined();
            expect(result.updated_at).toBeDefined();
            expect(() => new Date(result.created_at)).not.toThrow();
        });

        it('stores the client with provided fields', async () => {
            const result = await service.createClient(VALID_BODY);
            expect(result.first_name).toBe('John');
            expect(result.last_name).toBe('Smith');
            expect(result.email).toBe('john@example.com');
        });
    });

    // =========================================================================
    // getClientProfile()
    // =========================================================================

    describe('getClientProfile()', () => {
        it('throws NotFoundException for unknown client', async () => {
            mockClients = [];
            await expect(service.getClientProfile('unknown-id')).rejects.toThrow(NotFoundException);
        });

        it('aggregates interactions timeline', async () => {
            mockClients = [{ id: 'c1', first_name: 'A', last_name: 'B', email: 'a@x.com', phone_number: '123', business_name: 'Co', address: null, created_at: '2026-01-01', updated_at: '2026-01-01' }];
            mockInteractions = [
                { id: 'i1', clientId: 'c1', type: 'EMAIL', createdAt: '2026-01-01' },
                { id: 'i2', clientId: 'c1', type: 'CALL', createdAt: '2026-01-02' },
                { id: 'i3', clientId: 'other', type: 'EMAIL', createdAt: '2026-01-03' },
            ];
            const profile = await service.getClientProfile('c1');
            expect(profile.timeline.items).toHaveLength(2);
            expect(profile.timeline.summary.total).toBe(2);
            expect(profile.timeline.summary.byType['EMAIL']).toBe(1);
            expect(profile.timeline.summary.byType['CALL']).toBe(1);
        });

        it('computes totalBilled and openBalance (OPEN/OVERDUE only)', async () => {
            mockClients = [{ id: 'c1', first_name: 'A', last_name: 'B', email: 'a@x.com', phone_number: '123', business_name: 'Co', address: null, created_at: '2026-01-01', updated_at: '2026-01-01' }];
            mockTransactions = [
                { id: 't1', clientId: 'c1', status: 'PAID', amount: 300 },
                { id: 't2', clientId: 'c1', status: 'OPEN', amount: 200 },
                { id: 't3', clientId: 'c1', status: 'OVERDUE', amount: 150 },
            ];
            const profile = await service.getClientProfile('c1');
            expect(profile.billing.summary.totalBilled).toBe(650);
            expect(profile.billing.summary.openBalance).toBe(350);
        });

        it('excludes transactions from other clients', async () => {
            mockClients = [{ id: 'c1', first_name: 'A', last_name: 'B', email: 'a@x.com', phone_number: '123', business_name: 'Co', address: null, created_at: '2026-01-01', updated_at: '2026-01-01' }];
            mockTransactions = [
                { id: 't1', clientId: 'other', status: 'OPEN', amount: 999 },
            ];
            const profile = await service.getClientProfile('c1');
            expect(profile.billing.summary.totalBilled).toBe(0);
        });
    });
});
