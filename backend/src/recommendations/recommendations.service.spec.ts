import { InternalServerErrorException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsSupabaseService } from './recommendations.supabase.service';

// ---------------------------------------------------------------------------
// Mock Supabase chainable query builder
// ---------------------------------------------------------------------------

let queryResult: { data: any; error: any } = { data: [], error: null };

const mockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockImplementation(() => queryResult),
};

const mockDb = {
    from: jest.fn(() => mockQuery),
};

const mockDbService = {
    db: mockDb,
} as unknown as RecommendationsSupabaseService;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecommendationsService', () => {
    let service: RecommendationsService;

    beforeEach(() => {
        jest.clearAllMocks();
        queryResult = { data: [], error: null };
        mockQuery.select.mockReturnThis();
        mockQuery.eq.mockReturnThis();
        mockQuery.order.mockImplementation(() => queryResult);
        service = new RecommendationsService(mockDbService);
    });

    // =========================================================================
    // derivePriority() — tested indirectly via getRecommendations
    // =========================================================================

    it('assigns "high" priority when score >= 85', async () => {
        queryResult = {
            data: [{ recommendation_id: '1', client_id: 'c1', project_id: null, type: 'upsell', score: 90, recommendation: 'Do X', details: {}, created_at: '2026-01-01' }],
            error: null,
        };
        const { recommendations } = await service.getRecommendations();
        expect(recommendations[0].priority).toBe('high');
    });

    it('assigns "medium" priority when score >= 65 and < 85', async () => {
        queryResult = {
            data: [{ recommendation_id: '2', client_id: 'c1', project_id: null, type: 'upsell', score: 70, recommendation: 'Do Y', details: {}, created_at: '2026-01-01' }],
            error: null,
        };
        const { recommendations } = await service.getRecommendations();
        expect(recommendations[0].priority).toBe('medium');
    });

    it('assigns "low" priority when score < 65', async () => {
        queryResult = {
            data: [{ recommendation_id: '3', client_id: 'c1', project_id: null, type: 'upsell', score: 50, recommendation: 'Do Z', details: {}, created_at: '2026-01-01' }],
            error: null,
        };
        const { recommendations } = await service.getRecommendations();
        expect(recommendations[0].priority).toBe('low');
    });

    it('uses details.priority when present instead of derivePriority', async () => {
        queryResult = {
            data: [{ recommendation_id: '4', client_id: 'c1', project_id: null, type: 'upsell', score: 90, recommendation: 'Do A', details: { priority: 'low' }, created_at: '2026-01-01' }],
            error: null,
        };
        const { recommendations } = await service.getRecommendations();
        expect(recommendations[0].priority).toBe('low');
    });

    // =========================================================================
    // getRecommendations() — field mapping
    // =========================================================================

    it('maps DB rows to output shape with correct fields', async () => {
        queryResult = {
            data: [{
                recommendation_id: 'rec-1',
                client_id: 'client-1',
                project_id: 'proj-1',
                type: 'upsell',
                score: 88,
                recommendation: 'Offer premium tier',
                details: { reasons: ['high usage'], suggestedAction: 'Contact them' },
                created_at: '2026-01-15T00:00:00Z',
            }],
            error: null,
        };

        const { recommendations, total } = await service.getRecommendations();

        expect(total).toBe(1);
        expect(recommendations[0]).toMatchObject({
            id: 'rec-1',
            clientId: 'client-1',
            projectId: 'proj-1',
            type: 'upsell',
            score: 88,
            summary: 'Offer premium tier',
            reasons: ['high usage'],
            suggestedAction: 'Contact them',
            rankingPosition: 1,
            createdAt: '2026-01-15T00:00:00Z',
        });
    });

    it('assigns incrementing rankingPosition starting at 1', async () => {
        queryResult = {
            data: [
                { recommendation_id: 'r1', score: 90, type: 'upsell', recommendation: 'A', details: {}, created_at: '2026-01-01' },
                { recommendation_id: 'r2', score: 75, type: 'retain', recommendation: 'B', details: {}, created_at: '2026-01-01' },
                { recommendation_id: 'r3', score: 60, type: 'at-risk', recommendation: 'C', details: {}, created_at: '2026-01-01' },
            ],
            error: null,
        };
        const { recommendations } = await service.getRecommendations();
        expect(recommendations[0].rankingPosition).toBe(1);
        expect(recommendations[1].rankingPosition).toBe(2);
        expect(recommendations[2].rankingPosition).toBe(3);
    });

    // =========================================================================
    // Type filter
    // =========================================================================

    it('filters by type when provided', async () => {
        queryResult = { data: [], error: null };
        await service.getRecommendations({ type: 'upsell' });
        expect(mockQuery.eq).toHaveBeenCalledWith('type', 'upsell');
    });

    it('does not call eq when type is not provided', async () => {
        queryResult = { data: [], error: null };
        await service.getRecommendations();
        expect(mockQuery.eq).not.toHaveBeenCalled();
    });

    // =========================================================================
    // Edge cases
    // =========================================================================

    it('returns empty result set when no data', async () => {
        queryResult = { data: [], error: null };
        const result = await service.getRecommendations();
        expect(result.recommendations).toEqual([]);
        expect(result.total).toBe(0);
    });

    it('handles null data gracefully', async () => {
        queryResult = { data: null, error: null };
        const result = await service.getRecommendations();
        expect(result.recommendations).toEqual([]);
        expect(result.total).toBe(0);
    });

    it('throws InternalServerErrorException on Supabase error', async () => {
        queryResult = { data: null, error: { message: 'db failure' } };
        await expect(service.getRecommendations()).rejects.toThrow(InternalServerErrorException);
    });
});
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
