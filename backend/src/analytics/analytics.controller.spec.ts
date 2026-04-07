import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockSummary = {
    totalRevenue: 50000,
    totalClients: 20,
    newClients: 5,
    invoiceCount: 30,
    conversionRate: 67,
    revenueChange: 15,
    clientChange: 25,
  };

  const mockRevenue = [
    { month: 'Jan 2026', revenue: 8200 },
    { month: 'Feb 2026', revenue: 12500 },
  ];

  const mockClientGrowth = [
    { month: 'Jan 2026', clients: 3 },
    { month: 'Feb 2026', clients: 4 },
  ];

  const mockInvoiceStatus = { paid: 18, unpaid: 6, overdue: 3, cancelled: 3 };

  const mockAnalyticsService = {
    getSummary: jest.fn().mockResolvedValue(mockSummary),
    getRevenueByMonth: jest.fn().mockResolvedValue(mockRevenue),
    getClientGrowth: jest.fn().mockResolvedValue(mockClientGrowth),
    getInvoiceStatus: jest.fn().mockResolvedValue(mockInvoiceStatus),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /analytics/summary', () => {
    it('returns { ok: true, data } with correct shape', async () => {
      const result = await controller.getSummary({ range: '30d' });
      expect(result).toEqual({ ok: true, data: mockSummary });
      expect(service.getSummary).toHaveBeenCalledWith('30d');
    });

    it('passes range parameter to service', async () => {
      await controller.getSummary({ range: '7d' });
      expect(service.getSummary).toHaveBeenCalledWith('7d');
    });
  });

  describe('GET /analytics/revenue-by-month', () => {
    it('returns monthly revenue array', async () => {
      const result = await controller.getRevenueByMonth({ range: '1y' });
      expect(result).toEqual({ ok: true, data: mockRevenue });
      expect(service.getRevenueByMonth).toHaveBeenCalledWith('1y');
    });
  });

  describe('GET /analytics/client-growth', () => {
    it('returns client growth array', async () => {
      const result = await controller.getClientGrowth({ range: 'all' });
      expect(result).toEqual({ ok: true, data: mockClientGrowth });
      expect(service.getClientGrowth).toHaveBeenCalledWith('all');
    });
  });

  describe('GET /analytics/invoice-status', () => {
    it('returns invoice status counts', async () => {
      const result = await controller.getInvoiceStatus({ range: '90d' });
      expect(result).toEqual({ ok: true, data: mockInvoiceStatus });
      expect(service.getInvoiceStatus).toHaveBeenCalledWith('90d');
    });
  });
});
