import { ConflictException } from '@nestjs/common';
import { ClientsSupabaseService } from './clients.supabase.service';
import { SupabaseService } from '../supabase/supabase.service';

// ---------------------------------------------------------------------------
// Mock Supabase chainable query builder
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
    chain.maybeSingle = jest.fn().mockImplementation(() => mockSingle());
    chain.rpc = jest.fn().mockResolvedValue({ error: null });
    return chain;
}

const mockChain = buildChain();

const mockSupabaseService = {
    getClient: jest.fn(() => ({
        from: jest.fn(() => mockChain),
    })),
} as unknown as SupabaseService;

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const MOCK_CLIENT = {
    id: 'client-001',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone_number: '5551234567',
    business_name: 'ACME Corp',
    tags: ['contact-form'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ClientsSupabaseService', () => {
    let service: ClientsSupabaseService;

    beforeEach(() => {
        jest.clearAllMocks();
        orderReturnValue = { data: [], error: null };
        service = new ClientsSupabaseService(mockSupabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // =========================================================================
    // create()
    // =========================================================================

    describe('create()', () => {
        it('inserts client data and returns created client', async () => {
            mockSingle.mockResolvedValue({ data: MOCK_CLIENT, error: null });
            const result = await service.create({ first_name: 'Jane', email: 'jane@example.com' });
            expect(mockChain.insert).toHaveBeenCalled();
            expect(result).toEqual(MOCK_CLIENT);
        });

        it('throws on Supabase error', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { message: 'insert failed' } });
            await expect(service.create({ first_name: 'Bad' })).rejects.toThrow('Failed to create client: insert failed');
        });
    });

    // =========================================================================
    // findAll()
    // =========================================================================

    describe('findAll()', () => {
        it('returns all clients ordered by created_at descending', async () => {
            orderReturnValue = { data: [MOCK_CLIENT], error: null };
            const result = await service.findAll();
            expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(result).toEqual([MOCK_CLIENT]);
        });

        it('returns empty array when no clients', async () => {
            orderReturnValue = { data: null, error: null };
            const result = await service.findAll();
            expect(result).toEqual([]);
        });

        it('throws on Supabase error', async () => {
            orderReturnValue = { data: null, error: { message: 'fetch failed' } };
            await expect(service.findAll()).rejects.toThrow('Failed to fetch clients: fetch failed');
        });
    });

    // =========================================================================
    // findOne()
    // =========================================================================

    describe('findOne()', () => {
        it('returns a single client by ID', async () => {
            mockSingle.mockResolvedValue({ data: MOCK_CLIENT, error: null });
            const result = await service.findOne('client-001');
            expect(mockChain.eq).toHaveBeenCalledWith('id', 'client-001');
            expect(result).toEqual(MOCK_CLIENT);
        });

        it('throws "not found" for PGRST116 error code', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } });
            await expect(service.findOne('bad-id')).rejects.toThrow('Client with ID bad-id not found');
        });

        it('throws generic error for other Supabase errors', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'server error' } });
            await expect(service.findOne('bad-id')).rejects.toThrow('Failed to fetch client: server error');
        });
    });

    // =========================================================================
    // update()
    // =========================================================================

    describe('update()', () => {
        it('updates client and returns updated record', async () => {
            const updated = { ...MOCK_CLIENT, first_name: 'Janet' };
            mockSingle.mockResolvedValue({ data: updated, error: null });
            const result = await service.update('client-001', { first_name: 'Janet' });
            expect(mockChain.update).toHaveBeenCalledWith({ first_name: 'Janet' });
            expect(result.first_name).toBe('Janet');
        });

        it('throws "not found" for PGRST116', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'nf' } });
            await expect(service.update('bad-id', {})).rejects.toThrow('Client with ID bad-id not found');
        });
    });

    // =========================================================================
    // remove()
    // =========================================================================

    describe('remove()', () => {
        it('deletes a client without error', async () => {
            mockChain.eq.mockReturnValueOnce({ error: null });
            await expect(service.remove('client-001')).resolves.toBeUndefined();
        });

        it('throws on Supabase error', async () => {
            mockChain.eq.mockReturnValueOnce({ error: { message: 'delete failed' } });
            await expect(service.remove('bad-id')).rejects.toThrow('Failed to delete client: delete failed');
        });
    });

    // =========================================================================
    // searchClients()
    // =========================================================================

    describe('searchClients()', () => {
        it('applies searchTerm as ilike filter across name/email fields', async () => {
            orderReturnValue = { data: [MOCK_CLIENT], error: null };
            const result = await service.searchClients({ searchTerm: 'Jane' });
            expect(mockChain.or).toHaveBeenCalledWith(
                expect.stringContaining('Jane'),
            );
            expect(result).toEqual([MOCK_CLIENT]);
        });

        it('does not call or() when no searchTerm', async () => {
            orderReturnValue = { data: [MOCK_CLIENT], error: null };
            await service.searchClients({});
            expect(mockChain.or).not.toHaveBeenCalled();
        });

        it('applies state filter when provided', async () => {
            orderReturnValue = { data: [], error: null };
            await service.searchClients({ state: 'CA' });
            expect(mockChain.eq).toHaveBeenCalledWith('address->state', 'CA');
        });

        it('applies city filter when provided', async () => {
            orderReturnValue = { data: [], error: null };
            await service.searchClients({ city: 'Sacramento' });
            expect(mockChain.eq).toHaveBeenCalledWith('address->city', 'Sacramento');
        });

        it('applies zipCode filter when provided', async () => {
            orderReturnValue = { data: [], error: null };
            await service.searchClients({ zipCode: '95814' });
            expect(mockChain.eq).toHaveBeenCalledWith('address->zip_code', '95814');
        });

        it('throws on Supabase error', async () => {
            orderReturnValue = { data: null, error: { message: 'search failed' } };
            await expect(service.searchClients({})).rejects.toThrow('Search failed: search failed');
        });
    });

    // =========================================================================
    // createContactClient()
    // =========================================================================

    describe('createContactClient()', () => {
        it('throws when firstName is missing', async () => {
            await expect(service.createContactClient({ email: 'x@x.com' })).rejects.toThrow('Missing required fields');
        });

        it('throws when email is missing', async () => {
            await expect(service.createContactClient({ firstName: 'Bob' })).rejects.toThrow('Missing required fields');
        });

        it('throws ConflictException when email already exists', async () => {
            mockSingle.mockResolvedValueOnce({ data: { id: 'existing' }, error: null });
            await expect(
                service.createContactClient({ firstName: 'Bob', email: 'existing@x.com' }),
            ).rejects.toThrow(ConflictException);
        });

        it('assembles additional_info with source note', async () => {
            // First call: duplicate check returns null (no existing)
            mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
            // Second call: insert returns data
            mockSingle.mockResolvedValueOnce({ data: MOCK_CLIENT, error: null });

            await service.createContactClient({
                firstName: 'Bob',
                email: 'bob@x.com',
                message: 'Hello there',
                origin: 'headword.co',
            });

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        additional_info: expect.stringContaining('headword.co'),
                    }),
                ]),
            );
        });

        it('tags the client with contact-form', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
            mockSingle.mockResolvedValueOnce({ data: MOCK_CLIENT, error: null });

            await service.createContactClient({ firstName: 'Bob', email: 'new@x.com' });

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ tags: ['contact-form'] }),
                ]),
            );
        });

        it('includes newsletter note when opted in', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
            mockSingle.mockResolvedValueOnce({ data: MOCK_CLIENT, error: null });

            await service.createContactClient({
                firstName: 'Bob', email: 'bob2@x.com', newsletter: true,
            });

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        additional_info: expect.stringContaining('newsletter'),
                    }),
                ]),
            );
        });
    });
});
