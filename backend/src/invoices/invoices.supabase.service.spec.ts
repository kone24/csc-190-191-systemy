import { ConfigService } from '@nestjs/config';
import { InvoicesSupabaseService } from './invoices.supabase.service';

// ---------------------------------------------------------------------------
// Mock Supabase client — fully chainable, terminal calls resolve to result vars
// ---------------------------------------------------------------------------

// Terminal result stores — tests set these before calling the method under test
let singleResult: any = { data: null, error: null };
let orderResult: any = { data: [], error: null };
let limitResult: any = { data: [], error: null };
let ltResult: any = { data: [], error: null };
let deleteEqResult: any = { error: null };

// Build a chain where every method returns `chain`, but terminal calls resolve to
// the matching result variable.  `.order()` returns an augmented chain so that
// callers that chain `.limit()` after `.order()` still work.
function buildChain() {
    const chain: any = {};

    // Mutating / selection helpers — all return `chain` so they are chainable
    chain.insert = jest.fn().mockReturnValue(chain);
    chain.select = jest.fn().mockReturnValue(chain);
    chain.update = jest.fn().mockReturnValue(chain);
    chain.like   = jest.fn().mockReturnValue(chain);
    chain.or     = jest.fn().mockReturnValue(chain);

    // .eq() is used both as a non-terminal step (e.g. update/findOne) and as the
    // terminal step in .delete().eq().  We default to returning `chain`; tests
    // that need a terminal eq can override with mockReturnValueOnce.
    chain.eq = jest.fn().mockReturnValue(chain);

    // .delete() returns `chain`; its terminal `.eq()` is mocked per-test above.
    chain.delete = jest.fn().mockReturnValue(chain);

    // .lt() is terminal in findUnpaidPastDue
    chain.lt = jest.fn().mockImplementation(() => ltResult);

    // .order() returns an object that resolves (for findAll/search) AND has
    // a `.limit()` method (for nextInvoiceNumber).
    const orderChain: any = {
        limit: jest.fn().mockImplementation(() => limitResult),
        // Make orderChain itself thenable so `await chain.order(...)` works
        then: (resolve: any, reject: any) => Promise.resolve(orderResult).then(resolve, reject),
        catch: (reject: any) => Promise.resolve(orderResult).catch(reject),
    };
    chain.order = jest.fn().mockReturnValue(orderChain);

    // .single() is terminal
    chain.single = jest.fn().mockImplementation(() => singleResult);

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

const MOCK_INVOICE: any = {
    invoice_id: 'inv-001',
    invoice_number: 'INV-1001',
    status: 'unpaid',
    amount: 500,
    due_date: '2026-01-01',
    issued_by: 'user-1',
    clients: { id: 'c1', first_name: 'Jane', last_name: 'Doe' },
    users: { user_id: 'user-1', name: 'Alice' },
    project: { project_id: 'p1', name: 'Website' },
    metadata: {},
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeConfig(url = 'https://fake.supabase.co', key = 'fake-key') {
    return {
        get: jest.fn((k: string) => {
            if (k === 'SUPABASE_URL') return url;
            if (k === 'SUPABASE_SERVICE_ROLE_KEY') return key;
            return undefined;
        }),
    } as unknown as ConfigService;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InvoicesSupabaseService', () => {
    let service: InvoicesSupabaseService;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset all result stores to safe defaults
        singleResult   = { data: null, error: null };
        orderResult    = { data: [], error: null };
        limitResult    = { data: [], error: null };
        ltResult       = { data: [], error: null };
        deleteEqResult = { error: null };

        // Re-wire mocks that were overridden by mockReturnValueOnce
        mockChain.eq.mockReturnValue(mockChain);

        service = new InvoicesSupabaseService(makeConfig());
    });

    // =========================================================================
    // Constructor
    // =========================================================================

    describe('constructor', () => {
        it('throws when SUPABASE_URL is missing', () => {
            expect(() => new InvoicesSupabaseService(makeConfig('', 'key'))).toThrow(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided',
            );
        });

        it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
            expect(() => new InvoicesSupabaseService(makeConfig('https://x.supabase.co', ''))).toThrow(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided',
            );
        });
    });

    // =========================================================================
    // findAll()
    // =========================================================================

    describe('findAll()', () => {
        it('returns all invoices ordered by created_at descending', async () => {
            orderResult = { data: [MOCK_INVOICE], error: null };
            const result = await service.findAll();
            expect(result).toEqual([MOCK_INVOICE]);
            expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('returns empty array when no invoices exist', async () => {
            orderResult = { data: null, error: null };
            const result = await service.findAll();
            expect(result).toEqual([]);
        });

        it('throws on Supabase error', async () => {
            orderResult = { data: null, error: { message: 'fetch failed' } };
            await expect(service.findAll()).rejects.toThrow('Failed to fetch invoices: fetch failed');
        });
    });

    // =========================================================================
    // findOne()
    // =========================================================================

    describe('findOne()', () => {
        it('returns a single invoice by ID', async () => {
            singleResult = { data: MOCK_INVOICE, error: null };
            const result = await service.findOne('inv-001');
            expect(result).toEqual(MOCK_INVOICE);
            expect(mockChain.eq).toHaveBeenCalledWith('invoice_id', 'inv-001');
        });

        it('throws "not found" for PGRST116 error code', async () => {
            singleResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };
            await expect(service.findOne('bad-id')).rejects.toThrow('Invoice with ID bad-id not found');
        });

        it('throws generic error for other Supabase errors', async () => {
            singleResult = { data: null, error: { code: 'OTHER', message: 'db error' } };
            await expect(service.findOne('bad-id')).rejects.toThrow('Failed to fetch invoice: db error');
        });
    });

    // =========================================================================
    // create()
    // =========================================================================

    describe('create()', () => {
        it('inserts invoice data and returns the created invoice', async () => {
            limitResult  = { data: [], error: null };   // nextInvoiceNumber call
            singleResult = { data: MOCK_INVOICE, error: null };
            const result = await service.create({ status: 'unpaid' });
            expect(result).toEqual(MOCK_INVOICE);
        });

        it('auto-generates invoice number when not provided', async () => {
            limitResult  = { data: [], error: null };
            singleResult = { data: MOCK_INVOICE, error: null };
            await service.create({});
            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ invoice_number: expect.stringMatching(/^INV-/) }),
                ]),
            );
        });

        it('uses provided invoice number (does not regenerate)', async () => {
            singleResult = { data: MOCK_INVOICE, error: null };
            await service.create({ invoice_number: 'INV-9999' });
            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ invoice_number: 'INV-9999' }),
                ]),
            );
        });

        it('throws on Supabase error', async () => {
            limitResult  = { data: [], error: null };
            singleResult = { data: null, error: { message: 'insert failed' } };
            await expect(service.create({})).rejects.toThrow('Failed to create invoice: insert failed');
        });
    });

    // =========================================================================
    // nextInvoiceNumber() — tested indirectly via create()
    // =========================================================================

    describe('nextInvoiceNumber() (via create)', () => {
        it('returns INV-1000 when no invoices exist', async () => {
            limitResult  = { data: [], error: null };
            singleResult = { data: MOCK_INVOICE, error: null };
            await service.create({});
            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ invoice_number: 'INV-1000' })]),
            );
        });

        it('parses existing INV-* numbers and returns next', async () => {
            limitResult  = { data: [{ invoice_number: 'INV-1005' }, { invoice_number: 'INV-1003' }], error: null };
            singleResult = { data: MOCK_INVOICE, error: null };
            await service.create({});
            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ invoice_number: 'INV-1006' })]),
            );
        });
    });

    // =========================================================================
    // update()
    // =========================================================================

    describe('update()', () => {
        it('updates invoice fields and returns updated record', async () => {
            const updated = { ...MOCK_INVOICE, status: 'paid' };
            singleResult = { data: updated, error: null };
            const result = await service.update('inv-001', { status: 'paid' });
            expect(result.status).toBe('paid');
            expect(mockChain.update).toHaveBeenCalledWith({ status: 'paid' });
            expect(mockChain.eq).toHaveBeenCalledWith('invoice_id', 'inv-001');
        });

        it('throws "not found" for PGRST116 error code', async () => {
            singleResult = { data: null, error: { code: 'PGRST116', message: 'not found' } };
            await expect(service.update('bad-id', {})).rejects.toThrow('Invoice with ID bad-id not found');
        });

        it('throws generic error for other Supabase errors', async () => {
            singleResult = { data: null, error: { code: 'OTHER', message: 'update failed' } };
            await expect(service.update('id', {})).rejects.toThrow('Failed to update invoice: update failed');
        });
    });

    // =========================================================================
    // remove()
    // =========================================================================

    describe('remove()', () => {
        it('deletes an invoice by ID without error', async () => {
            mockChain.eq.mockReturnValueOnce({ error: null });
            await expect(service.remove('inv-001')).resolves.toBeUndefined();
            expect(mockChain.delete).toHaveBeenCalled();
        });

        it('throws when Supabase returns an error', async () => {
            mockChain.eq.mockReturnValueOnce({ error: { message: 'delete failed' } });
            await expect(service.remove('bad-id')).rejects.toThrow('Failed to delete invoice: delete failed');
        });
    });

    // =========================================================================
    // search()
    // =========================================================================

    describe('search()', () => {
        it('searches by invoice_number with ilike', async () => {
            orderResult = { data: [MOCK_INVOICE], error: null };
            const result = await service.search('INV-1001');
            expect(mockChain.or).toHaveBeenCalledWith('invoice_number.ilike.%INV-1001%');
            expect(result).toEqual([MOCK_INVOICE]);
        });

        it('returns empty array when no results match', async () => {
            orderResult = { data: null, error: null };
            const result = await service.search('zzz');
            expect(result).toEqual([]);
        });

        it('throws on Supabase error', async () => {
            orderResult = { data: null, error: { message: 'search error' } };
            await expect(service.search('term')).rejects.toThrow('Search failed: search error');
        });
    });

    // =========================================================================
    // findUnpaidPastDue()
    // =========================================================================

    describe('findUnpaidPastDue()', () => {
        it('filters status=unpaid and due_date < now', async () => {
            ltResult = { data: [MOCK_INVOICE], error: null };
            const result = await service.findUnpaidPastDue();
            expect(mockChain.eq).toHaveBeenCalledWith('status', 'unpaid');
            expect(mockChain.lt).toHaveBeenCalledWith('due_date', expect.any(String));
            expect(result).toEqual([MOCK_INVOICE]);
        });

        it('returns empty array when no past-due unpaid invoices', async () => {
            ltResult = { data: null, error: null };
            const result = await service.findUnpaidPastDue();
            expect(result).toEqual([]);
        });

        it('throws on Supabase error', async () => {
            ltResult = { data: null, error: { message: 'overdue fetch failed' } };
            await expect(service.findUnpaidPastDue()).rejects.toThrow('Failed to fetch overdue invoices: overdue fetch failed');
        });
    });
});
