import { ConfigService } from '@nestjs/config';
import { VendorsSupabaseService } from './vendors.supabase.service';

// ---------------------------------------------------------------------------
// Mock Supabase client — chainable query builder
// ---------------------------------------------------------------------------

const mockSingle = jest.fn();
let orderReturnValue: any = { data: [], error: null };

function buildChain() {
    const chain: any = {};
    chain.insert = jest.fn().mockReturnValue(chain);
    chain.select = jest.fn().mockReturnValue(chain);
    chain.update = jest.fn().mockReturnValue(chain);
    chain.delete = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.or = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockImplementation(() => orderReturnValue);
    chain.single = jest.fn().mockImplementation(() => mockSingle());
    return chain;
}

const mockChain = buildChain();

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(() => mockChain),
    })),
}));

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const MOCK_VENDOR = {
    id: 'uuid-vendor-001',
    first_name: 'Acme',
    last_name: 'Corp',
    email: 'contact@acme.example.com',
    company: 'Acme Corporation',
    business_name: 'Acme Supplies',
    status: 'active',
    project_id: 'proj-001',
    project: { project_id: 'proj-001', name: 'Website Redesign' },
    tags: ['Preferred|#22C55E'],
    created_at: '2026-03-22T00:00:00Z',
    updated_at: '2026-03-22T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('VendorsSupabaseService', () => {
    let service: VendorsSupabaseService;

    beforeEach(() => {
        jest.clearAllMocks();

        const configService = {
            get: jest.fn((key: string) => {
                const map: Record<string, string> = {
                    SUPABASE_URL: 'https://fake.supabase.co',
                    SUPABASE_SERVICE_ROLE_KEY: 'fake-key',
                };
                return map[key];
            }),
        } as unknown as ConfigService;

        service = new VendorsSupabaseService(configService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // =========================================================================
    // Constructor — Supabase init validation
    // =========================================================================

    describe('constructor', () => {
        it('should throw if SUPABASE_URL is missing', () => {
            const badConfig = {
                get: jest.fn(() => undefined),
            } as unknown as ConfigService;

            expect(() => new VendorsSupabaseService(badConfig)).toThrow(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided',
            );
        });

        it('should throw if SUPABASE_SERVICE_ROLE_KEY is missing', () => {
            const badConfig = {
                get: jest.fn((key: string) => (key === 'SUPABASE_URL' ? 'https://x.supabase.co' : undefined)),
            } as unknown as ConfigService;

            expect(() => new VendorsSupabaseService(badConfig)).toThrow(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided',
            );
        });
    });

    // =========================================================================
    // create()
    // =========================================================================

    describe('create()', () => {
        it('should insert vendor data and return the created vendor with project join', async () => {
            mockSingle.mockResolvedValue({ data: MOCK_VENDOR, error: null });

            const result = await service.create({ first_name: 'Acme' });

            expect(mockChain.insert).toHaveBeenCalledWith([{ first_name: 'Acme' }]);
            expect(mockChain.select).toHaveBeenCalledWith('*, project(project_id, name)');
            expect(result).toEqual(MOCK_VENDOR);
        });

        it('should throw when Supabase returns an error', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { message: 'insert failed' } });

            await expect(service.create({ first_name: 'Bad' })).rejects.toThrow(
                'Failed to create vendor: insert failed',
            );
        });
    });

    // =========================================================================
    // findAll()
    // =========================================================================

    describe('findAll()', () => {
        it('should return all vendors ordered by created_at descending', async () => {
            orderReturnValue = { data: [MOCK_VENDOR], error: null };

            const result = await service.findAll();

            expect(mockChain.select).toHaveBeenCalledWith('*, project(project_id, name)');
            expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(result).toEqual([MOCK_VENDOR]);
        });

        it('should return empty array when no vendors exist', async () => {
            orderReturnValue = { data: null, error: null };

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('should throw when Supabase returns an error', async () => {
            orderReturnValue = { data: null, error: { message: 'fetch failed' } };

            await expect(service.findAll()).rejects.toThrow('Failed to fetch vendors: fetch failed');
        });
    });

    // =========================================================================
    // findOne()
    // =========================================================================

    describe('findOne()', () => {
        it('should return a single vendor by ID with project join', async () => {
            mockSingle.mockResolvedValue({ data: MOCK_VENDOR, error: null });

            const result = await service.findOne('uuid-vendor-001');

            expect(mockChain.eq).toHaveBeenCalledWith('id', 'uuid-vendor-001');
            expect(result).toEqual(MOCK_VENDOR);
        });

        it('should throw "not found" for PGRST116 error code', async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'not found' },
            });

            await expect(service.findOne('bad-id')).rejects.toThrow(
                'Vendor with ID bad-id not found',
            );
        });

        it('should throw generic error for other Supabase errors', async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: { code: 'OTHER', message: 'server error' },
            });

            await expect(service.findOne('bad-id')).rejects.toThrow(
                'Failed to fetch vendor: server error',
            );
        });
    });

    // =========================================================================
    // update()
    // =========================================================================

    describe('update()', () => {
        it('should update vendor fields and return the updated record', async () => {
            const updated = { ...MOCK_VENDOR, company: 'New Name' };
            mockSingle.mockResolvedValue({ data: updated, error: null });

            const result = await service.update('uuid-vendor-001', { company: 'New Name' });

            expect(mockChain.update).toHaveBeenCalledWith({ company: 'New Name' });
            expect(mockChain.eq).toHaveBeenCalledWith('id', 'uuid-vendor-001');
            expect(mockChain.select).toHaveBeenCalledWith('*, project(project_id, name)');
            expect(result.company).toBe('New Name');
        });

        it('should throw "not found" for PGRST116 error code', async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'not found' },
            });

            await expect(service.update('bad-id', { company: 'X' })).rejects.toThrow(
                'Vendor with ID bad-id not found',
            );
        });

        it('should throw generic error for other Supabase errors', async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: { code: 'OTHER', message: 'update failed' },
            });

            await expect(service.update('id', { company: 'X' })).rejects.toThrow(
                'Failed to update vendor: update failed',
            );
        });
    });

    // =========================================================================
    // remove()
    // =========================================================================

    describe('remove()', () => {
        it('should delete a vendor by ID without error', async () => {
            // For remove: chain is .delete().eq() — eq returns { error }
            mockChain.eq.mockReturnValueOnce({ error: null });

            await expect(service.remove('uuid-vendor-001')).resolves.toBeUndefined();
            expect(mockChain.delete).toHaveBeenCalled();
        });

        it('should throw when Supabase returns an error', async () => {
            mockChain.eq.mockReturnValueOnce({ error: { message: 'delete failed' } });

            await expect(service.remove('bad-id')).rejects.toThrow(
                'Failed to delete vendor: delete failed',
            );
        });
    });

    // =========================================================================
    // search()
    // =========================================================================

    describe('search()', () => {
        it('should search across name, email, company, and business_name fields', async () => {
            orderReturnValue = { data: [MOCK_VENDOR], error: null };

            const result = await service.search('Acme');

            expect(mockChain.or).toHaveBeenCalledWith(
                'first_name.ilike.%Acme%,last_name.ilike.%Acme%,email.ilike.%Acme%,company.ilike.%Acme%,business_name.ilike.%Acme%',
            );
            expect(mockChain.select).toHaveBeenCalledWith('*, project(project_id, name)');
            expect(result).toEqual([MOCK_VENDOR]);
        });

        it('should return empty array when no results match', async () => {
            orderReturnValue = { data: null, error: null };

            const result = await service.search('zzz-no-match');

            expect(result).toEqual([]);
        });

        it('should throw when Supabase returns an error', async () => {
            orderReturnValue = { data: null, error: { message: 'search failed' } };

            await expect(service.search('term')).rejects.toThrow('Search failed: search failed');
        });

        it('should order results by created_at descending', async () => {
            orderReturnValue = { data: [], error: null };

            await service.search('test');

            expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });
    });
});
