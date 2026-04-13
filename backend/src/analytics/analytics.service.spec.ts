import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

/**
 * Creates a Supabase query-builder chain that:
 *  - has all chainable methods (select, eq, gte, lt, order) returning `this`
 *  - is thenable: when awaited it resolves to `resolveValue`
 */
function makeChain(resolveValue: any) {
  const chain: any = {};
  for (const method of ['select', 'eq', 'gte', 'lt', 'order']) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }
  chain.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(resolveValue).then(onFulfilled, onRejected);
  chain.catch = (onRejected: any) =>
    Promise.resolve(resolveValue).catch(onRejected);
  return chain;
}

const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SUPABASE_URL') return 'https://fake.supabase.co';
              if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-key';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('returns summary shape with all required fields', async () => {
      const invoices = [
        { amount: '3000', status: 'paid' },
        { amount: '5000', status: 'paid' },
        { amount: '2000', status: 'unpaid' },
      ];

      // getSummary('30d') makes 5 from() calls in order:
      // 1. totalClients  (select head:true)
      // 2. newClients    (select head:true + gte)
      // 3. current invoices (select + gte)
      // 4. prev new clients (select head:true + gte + lt)
      // 5. prev invoices    (select + gte + lt)
      mockFrom
        .mockReturnValueOnce(makeChain({ count: 20, error: null }))
        .mockReturnValueOnce(makeChain({ count: 5, error: null }))
        .mockReturnValueOnce(makeChain({ data: invoices, error: null }))
        .mockReturnValueOnce(makeChain({ count: 3, error: null }))
        .mockReturnValueOnce(makeChain({ data: [{ amount: '2000', status: 'paid' }], error: null }));

      const result = await service.getSummary('30d');

      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('totalClients');
      expect(result).toHaveProperty('newClients');
      expect(result).toHaveProperty('invoiceCount');
      expect(result).toHaveProperty('conversionRate');
      expect(result).toHaveProperty('revenueChange');
      expect(result).toHaveProperty('clientChange');
    });
  });

  describe('getRevenueByMonth', () => {
    it('returns array of { month, revenue } objects', async () => {
      const invoices = [
        { amount: '3000', created_at: '2026-01-15T00:00:00Z', status: 'paid' },
        { amount: '4500', created_at: '2026-01-20T00:00:00Z', status: 'paid' },
        { amount: '2000', created_at: '2026-02-10T00:00:00Z', status: 'paid' },
      ];
      mockFrom.mockReturnValueOnce(makeChain({ data: invoices, error: null }));

      const result = await service.getRevenueByMonth('all');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      for (const item of result) {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('revenue');
        expect(typeof item.revenue).toBe('number');
      }
    });
  });

  describe('getClientGrowth', () => {
    it('returns array of { month, clients } objects', async () => {
      const clients = [
        { created_at: '2026-01-05T00:00:00Z' },
        { created_at: '2026-01-18T00:00:00Z' },
        { created_at: '2026-02-02T00:00:00Z' },
      ];
      mockFrom.mockReturnValueOnce(makeChain({ data: clients, error: null }));

      const result = await service.getClientGrowth('all');

      expect(Array.isArray(result)).toBe(true);
      for (const item of result) {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('clients');
        expect(typeof item.clients).toBe('number');
      }
    });
  });

  describe('getInvoiceStatus', () => {
    it('returns counts for each status', async () => {
      const invoices = [
        { status: 'paid' },
        { status: 'paid' },
        { status: 'unpaid' },
        { status: 'overdue' },
        { status: 'cancelled' },
      ];
      mockFrom.mockReturnValueOnce(makeChain({ data: invoices, error: null }));

      const result = await service.getInvoiceStatus('all');

      expect(result).toEqual({
        paid: 2,
        unpaid: 1,
        overdue: 1,
        cancelled: 1,
      });
    });

    it('returns zeros when no invoices exist', async () => {
      mockFrom.mockReturnValueOnce(makeChain({ data: [], error: null }));

      const result = await service.getInvoiceStatus('7d');

      expect(result).toEqual({
        paid: 0,
        unpaid: 0,
        overdue: 0,
        cancelled: 0,
      });
    });
  });
});
