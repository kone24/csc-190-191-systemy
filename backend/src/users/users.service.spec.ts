import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

// ---------------------------------------------------------------------------
// Mock Supabase so no real network calls happen
// ---------------------------------------------------------------------------
const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({ from: mockFrom })),
}));

// ---------------------------------------------------------------------------
// Supabase query-builder chain helpers
// ---------------------------------------------------------------------------

/** select(...).eq(...) → resolves { data, error } */
function selectChain(data: any, error: any = null) {
    const eq = jest.fn().mockResolvedValue({ data, error });
    const select = jest.fn().mockReturnValue({ eq });
    return { select, eq };
}

/** select() with no eq — used for findAll */
function selectAllChain(data: any, error: any = null) {
    const select = jest.fn().mockResolvedValue({ data, error });
    return { select };
}

/** update({ role }).eq('user_id', ...) → resolves { error } */
function updateChain(error: any = null) {
    const eq = jest.fn().mockResolvedValue({ error });
    const update = jest.fn().mockReturnValue({ eq });
    return { update, eq };
}

/** select('timezone').eq(...).maybeSingle() → resolves { data, error } */
function selectMaybeSingleChain(data: any, error: any = null) {
    const maybeSingle = jest.fn().mockResolvedValue({ data, error });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    return { select, eq, maybeSingle };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        mockFrom.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'SUPABASE_URL') return 'https://fake.supabase.co';
                            if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-service-role-key';
                            return undefined;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    // =========================================================================
    // findAll
    // =========================================================================
    describe('findAll()', () => {
        it('returns mapped users when Supabase returns data', async () => {
            const raw = [
                { user_id: 'u1', name: 'Alice', email: 'alice@ex.com', role: 'admin' },
                { user_id: 'u2', name: 'Bob', email: 'bob@ex.com', role: 'staff' },
            ];
            mockFrom.mockReturnValue(selectAllChain(raw));

            const result = await service.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ user_id: 'u1', name: 'Alice', email: 'alice@ex.com', role: 'admin' });
            expect(result[1]).toEqual({ user_id: 'u2', name: 'Bob', email: 'bob@ex.com', role: 'staff' });
        });

        it('returns empty array when Supabase returns null data', async () => {
            mockFrom.mockReturnValue(selectAllChain(null));

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('throws when Supabase returns an error', async () => {
            mockFrom.mockReturnValue(selectAllChain(null, { message: 'DB error' }));

            await expect(service.findAll()).rejects.toThrow('Failed to fetch users: DB error');
        });
    });

    // =========================================================================
    // updateRole
    // =========================================================================
    describe('updateRole()', () => {
        it('resolves without error when Supabase update succeeds', async () => {
            const chain = updateChain(null);
            mockFrom.mockReturnValue(chain);

            await expect(service.updateRole('u1', 'manager')).resolves.toBeUndefined();
            expect(chain.update).toHaveBeenCalledWith({ role: 'manager' });
            expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
        });

        it('throws when Supabase update returns an error', async () => {
            mockFrom.mockReturnValue(updateChain({ message: 'constraint violation' }));

            await expect(service.updateRole('u1', 'manager')).rejects.toThrow(
                'Failed to update user role: constraint violation',
            );
        });

        it('calls update with the exact role string passed', async () => {
            const chain = updateChain(null);
            mockFrom.mockReturnValue(chain);

            await service.updateRole('some-uuid', 'admin');

            expect(chain.update).toHaveBeenCalledWith({ role: 'admin' });
        });
    });

    // =========================================================================
    // getTimezone
    // =========================================================================
    describe('getTimezone()', () => {
        it('returns timezone when Supabase returns data', async () => {
            mockFrom.mockReturnValue(selectMaybeSingleChain({ timezone: 'America/New_York' }));

            const result = await service.getTimezone('u1');

            expect(result).toBe('America/New_York');
        });

        it('returns default timezone when Supabase returns null data', async () => {
            mockFrom.mockReturnValue(selectMaybeSingleChain(null));

            const result = await service.getTimezone('u1');

            expect(result).toBe('America/Los_Angeles');
        });

        it('returns default timezone when timezone field is null', async () => {
            mockFrom.mockReturnValue(selectMaybeSingleChain({ timezone: null }));

            const result = await service.getTimezone('u1');

            expect(result).toBe('America/Los_Angeles');
        });

        it('returns default timezone when Supabase returns an error', async () => {
            mockFrom.mockReturnValue(selectMaybeSingleChain(null, { message: 'DB error' }));

            const result = await service.getTimezone('u1');

            expect(result).toBe('America/Los_Angeles');
        });
    });

    // =========================================================================
    // updateTimezone
    // =========================================================================
    describe('updateTimezone()', () => {
        it('resolves without error when Supabase update succeeds', async () => {
            const chain = updateChain(null);
            mockFrom.mockReturnValue(chain);

            await expect(service.updateTimezone('u1', 'America/Chicago')).resolves.toBeUndefined();
            expect(chain.update).toHaveBeenCalledWith({ timezone: 'America/Chicago' });
            expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
        });

        it('throws when Supabase update returns an error', async () => {
            mockFrom.mockReturnValue(updateChain({ message: 'update failed' }));

            await expect(service.updateTimezone('u1', 'America/Denver')).rejects.toThrow(
                'Failed to update user timezone: update failed',
            );
        });
    });
});
