import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';

// Supabase mock helpers
const mockInsert = jest.fn();
const mockSelectChain = {
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
};
const mockSelect = jest.fn(() => mockSelectChain);

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table !== 'change_audit') throw new Error(`Unexpected table: ${table}`);
      return { insert: mockInsert, select: mockSelect };
    },
  }),
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'SUPABASE_URL') return 'https://fake.supabase.co';
              if (key === 'SUPABASE_ANON_KEY') return 'fake-key';
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuditService);
  });

  describe('log()', () => {
    it('should insert an audit row with the correct payload', async () => {
      await service.log('client', 'uuid-123', 'update', { status: { old: 'Lead', new: 'Active' } }, 'user-456');

      expect(mockInsert).toHaveBeenCalledWith({
        entity_type: 'client',
        entity_id: 'uuid-123',
        action: 'update',
        performed_by: 'user-456',
        diff: { status: { old: 'Lead', new: 'Active' } },
      });
    });

    it('should set performed_by to null when not provided', async () => {
      await service.log('client', 'uuid-123', 'create', null);
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ performed_by: null }));
    });

    it('should not throw when insert fails', async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: 'db error' } });
      await expect(service.log('client', 'id', 'delete', null)).resolves.toBeUndefined();
    });
  });

  describe('getHistory()', () => {
    it('should query change_audit with correct filters', async () => {
      mockSelectChain.order.mockResolvedValueOnce({
        data: [{ audit_id: '1', action: 'update', diff: {} }],
        error: null,
      });

      const result = await service.getHistory('client', 'uuid-123');

      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockSelectChain.eq).toHaveBeenCalledWith('entity_type', 'client');
      expect(mockSelectChain.eq).toHaveBeenCalledWith('entity_id', 'uuid-123');
      expect(result).toHaveLength(1);
    });

    it('should return empty array on error', async () => {
      mockSelectChain.order.mockResolvedValueOnce({ data: null, error: { message: 'fail' } });
      const result = await service.getHistory('client', 'any');
      expect(result).toEqual([]);
    });
  });
});
