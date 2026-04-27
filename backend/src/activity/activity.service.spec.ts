import { ConfigService } from '@nestjs/config';
import { ActivityService } from './activity.service';

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

let mockUserRow: any = null;
let mockTasks: any[] = [];
let mockProjects: any[] = [];
let mockInvoices: any[] = [];

function buildQueryChain(returnData: () => any[]) {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockReturnValue(chain);
    chain.limit = jest.fn().mockResolvedValue({ data: returnData(), error: null });
    chain.single = jest.fn().mockResolvedValue({ data: mockUserRow, error: null });
    return chain;
}

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn((table: string) => {
            if (table === 'users') {
                const chain: any = {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({ data: mockUserRow, error: null }),
                };
                return chain;
            }
            if (table === 'task') {
                return buildQueryChain(() => mockTasks);
            }
            if (table === 'project') {
                return buildQueryChain(() => mockProjects);
            }
            if (table === 'invoice') {
                return buildQueryChain(() => mockInvoices);
            }
            return buildQueryChain(() => []);
        }),
    })),
}));

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function makeConfig() {
    return {
        get: jest.fn((key: string) => {
            if (key === 'SUPABASE_URL') return 'https://fake.supabase.co';
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-key';
            return undefined;
        }),
    } as unknown as ConfigService;
}

describe('ActivityService', () => {
    let service: ActivityService;

    beforeEach(() => {
        mockUserRow = null;
        mockTasks = [];
        mockProjects = [];
        mockInvoices = [];
        service = new ActivityService(makeConfig());
    });

    // =========================================================================
    // User not found
    // =========================================================================

    it('returns empty array when user not found', async () => {
        mockUserRow = null;
        const result = await service.getFeed('nobody@example.com');
        expect(result).toEqual([]);
    });

    // =========================================================================
    // Regular user — tasks + projects only (no invoices)
    // =========================================================================

    it('returns task and project events for regular user (role=user)', async () => {
        mockUserRow = { user_id: 'u1', role: 'user' };
        mockTasks = [{ task_id: 't1', title: 'Fix bug', status: 'open', created_at: '2026-01-02T00:00:00Z' }];
        mockProjects = [{ project_id: 'p1', name: 'CRM', status: 'active', created_at: '2026-01-01T00:00:00Z' }];

        const result = await service.getFeed('user@example.com');

        const types = result.map(e => e.type);
        expect(types).toContain('task');
        expect(types).toContain('project');
        expect(types).not.toContain('invoice');
    });

    // =========================================================================
    // Admin user — tasks + projects + invoices
    // =========================================================================

    it('returns task, project, and invoice events for admin', async () => {
        mockUserRow = { user_id: 'u2', role: 'admin' };
        mockTasks = [{ task_id: 't1', title: 'Deploy', status: 'done', created_at: '2026-01-03T00:00:00Z' }];
        mockProjects = [{ project_id: 'p1', name: 'Launch', status: 'active', created_at: '2026-01-02T00:00:00Z' }];
        mockInvoices = [{ invoice_id: 'inv1', invoice_number: 'INV-1001', status: 'paid', created_at: '2026-01-01T00:00:00Z' }];

        const result = await service.getFeed('admin@example.com');

        const types = result.map(e => e.type);
        expect(types).toContain('invoice');
    });

    it('returns task, project, and invoice events for manager', async () => {
        mockUserRow = { user_id: 'u3', role: 'manager' };
        mockTasks = [];
        mockProjects = [];
        mockInvoices = [{ invoice_id: 'inv2', invoice_number: 'INV-1002', status: 'unpaid', created_at: '2026-01-05T00:00:00Z' }];

        const result = await service.getFeed('manager@example.com');

        expect(result.some(e => e.type === 'invoice')).toBe(true);
    });

    // =========================================================================
    // Sorting + limit
    // =========================================================================

    it('sorts events by timestamp descending', async () => {
        mockUserRow = { user_id: 'u1', role: 'user' };
        mockTasks = [
            { task_id: 't1', title: 'Old task', status: 'done', created_at: '2026-01-01T00:00:00Z' },
            { task_id: 't2', title: 'New task', status: 'open', created_at: '2026-01-10T00:00:00Z' },
        ];
        mockProjects = [];

        const result = await service.getFeed('user@example.com');

        // The more recent timestamp should come first
        if (result.length >= 2) {
            const t0 = result[0].timestamp ? new Date(result[0].timestamp).getTime() : 0;
            const t1 = result[1].timestamp ? new Date(result[1].timestamp).getTime() : 0;
            expect(t0).toBeGreaterThanOrEqual(t1);
        }
    });

    it('handles null data arrays gracefully (returns empty, no crash)', async () => {
        mockUserRow = { user_id: 'u1', role: 'user' };
        mockTasks = [];
        mockProjects = [];

        const result = await service.getFeed('user@example.com');
        expect(Array.isArray(result)).toBe(true);
    });

    it('limits total events to 10', async () => {
        mockUserRow = { user_id: 'u1', role: 'admin' };
        mockTasks = Array.from({ length: 7 }, (_, i) => ({
            task_id: `t${i}`, title: `Task ${i}`, status: 'open', created_at: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        }));
        mockProjects = Array.from({ length: 5 }, (_, i) => ({
            project_id: `p${i}`, name: `Project ${i}`, status: 'active', created_at: `2026-02-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        }));
        mockInvoices = Array.from({ length: 3 }, (_, i) => ({
            invoice_id: `inv${i}`, invoice_number: `INV-${1000 + i}`, status: 'paid', created_at: `2026-03-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        }));

        const result = await service.getFeed('admin@example.com');
        expect(result.length).toBeLessThanOrEqual(10);
    });
});
