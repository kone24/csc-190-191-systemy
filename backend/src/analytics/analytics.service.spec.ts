import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockGte = jest.fn();
const mockLt = jest.fn();
const mockOrder = jest.fn();

const chainMethods = () => ({
  select: mockSelect,
  eq: mockEq,
  gte: mockGte,
  lt: mockLt,
  order: mockOrder,
});

// Each method returns the chain so queries can be chained
[mockSelect, mockEq, mockGte, mockLt, mockOrder].forEach((fn) => {
  fn.mockReturnValue({
    select: mockSelect,
    eq: mockEq,
    gte: mockGte,
    lt: mockLt,
    order: mockOrder,
    // terminal — resolves to { data, error, count }
    then: undefined,
  });
});

const mockFrom = jest.fn().mockReturnValue(chainMethods());

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
      // Mock the chain for clients count (head: true)
      mockSelect.mockResolvedValueOnce({ count: 20, error: null }); // totalClients
      mockSelect.mockResolvedValueOnce({ count: 5, error: null });  // newClients (gte applied)
      mockGte.mockResolvedValueOnce({ count: 5, error: null });

      // Mock for invoices
      const invoices = [
        { amount: '3000', status: 'paid' },
        { amount: '5000', status: 'paid' },
        { amount: '2000', status: 'unpaid' },
      ];
      mockSelect.mockResolvedValueOnce({ data: invoices, error: null });

      // Previous period queries
      mockLt.mockResolvedValueOnce({ count: 3, error: null }); // prev clients
      mockLt.mockResolvedValueOnce({
        data: [{ amount: '2000', status: 'paid' }],
        error: null,
      }); // prev invoices

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
      mockOrder.mockResolvedValueOnce({ data: invoices, error: null });

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
      mockOrder.mockResolvedValueOnce({ data: clients, error: null });

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
      mockSelect.mockResolvedValueOnce({ data: invoices, error: null });

      const result = await service.getInvoiceStatus('all');

      expect(result).toEqual({
        paid: 2,
        unpaid: 1,
        overdue: 1,
        cancelled: 1,
      });
    });

    it('returns zeros when no invoices exist', async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });

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
