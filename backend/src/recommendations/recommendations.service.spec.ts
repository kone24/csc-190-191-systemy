import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsSupabaseService } from './recommendations.supabase.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  // Mock Supabase chainable API
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };

  const mockRecommendationsSupabaseService = {
    db: mockSupabase,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: RecommendationsSupabaseService,
          useValue: mockRecommendationsSupabaseService,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // getRecommendations
  // =========================================================================
  describe('getRecommendations', () => {
    it('should return mapped recommendations', async () => {
      const fakeDbResponse = [
        {
          recommendation_id: 'rec-1',
          client_id: 'client-1',
          project_id: null,
          type: 'high_potential_lead',
          score: 92,
          recommendation: 'Strong lead based on engagement.',
          details: {
            reasons: ['Recent interaction', 'Strong fit'],
            suggestedAction: 'Call this week',
            priority: 'high',
          },
          created_at: '2026-04-12T12:00:00Z',
        },
      ];

      // simulate supabase response
      mockSupabase.order.mockResolvedValue({
        data: fakeDbResponse,
        error: null,
      });

      const result = await service.getRecommendations();

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('total');

      expect(result.total).toBe(1);

      const item = result.recommendations[0];

      expect(item.id).toBe('rec-1');
      expect(item.type).toBe('high_potential_lead');
      expect(item.score).toBe(92);
      expect(item.summary).toBe('Strong lead based on engagement.');
      expect(item.reasons).toEqual(['Recent interaction', 'Strong fit']);
      expect(item.priority).toBe('high');
    });

    it('should filter by type', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.getRecommendations({ type: 'upsell_opportunity' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('type', 'upsell_opportunity');
    });

    it('should return empty array when no recommendations exist', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getRecommendations();

      expect(result.recommendations).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should derive priority when not provided', async () => {
      const fakeDbResponse = [
        {
          recommendation_id: 'rec-2',
          client_id: null,
          project_id: null,
          type: 'reactivation_candidate',
          score: 88,
          recommendation: 'Re-engage this client.',
          details: {}, // no priority here
          created_at: '2026-04-12T12:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: fakeDbResponse,
        error: null,
      });

      const result = await service.getRecommendations();

      expect(result.recommendations[0].priority).toBe('high');
    });

    it('should throw error if supabase fails', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.getRecommendations()).rejects.toThrow(
        'Database error',
      );
    });
  });
});