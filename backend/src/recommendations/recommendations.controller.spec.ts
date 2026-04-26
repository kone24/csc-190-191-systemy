import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';


// ---------------------------------------------------------------------------
// Mock RecommendationsService — controller tests only
// ---------------------------------------------------------------------------
const mockRecommendationsService = {
    getRecommendations: jest.fn(),
};

const mockRecommendationsGeneratorService = {
    regenerateRecommendations: jest.fn(),
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('RecommendationsController', () => {
    let controller: RecommendationsController;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RecommendationsController],
            providers: [
                { 
                    provide: RecommendationsService,
                    useValue: mockRecommendationsService,
                },
            ],
        }).compile();

        controller = module.get<RecommendationsController>(RecommendationsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // =========================================================================
    // GET /recommendations — list()
    // =========================================================================
    describe('getRecommendations', () => {
        it('should return recommendations with no filters', async () => {
            const fakeResponse = {
                recommendations: [
                {
                    id: 'rec-1',
                    clientId: 'client-1',
                    projectId: null,
                    type: 'high_potential_lead',
                    score: 92,
                    summary: 'Strong lead based on recent engagement and fit.',
                    reasons: ['Recent interaction', 'Strong service fit'],
                    suggestedAction: 'Schedule a discovery call',
                    priority: 'high',
                    rankingPosition: 1,
                    createdAt: '2026-04-12T12:00:00.000Z',
                },
                {
                    id: 'rec-2',
                    clientId: 'client-2',
                    projectId: null,
                    type: 'upsell_opportunity',
                    score: 81,
                    summary: 'Existing client may be ready for expanded services.',
                    reasons: ['Existing relationship', 'Past project success'],
                    suggestedAction: 'Pitch an upsell package',
                    priority: 'medium',
                    rankingPosition: 2,
                    createdAt: '2026-04-12T12:05:00.000Z',
                },
                ],
                total: 2,
            };

            mockRecommendationsService.getRecommendations.mockResolvedValue(fakeResponse);

            const result = await controller.getRecommendations(undefined, undefined);

            expect(result).toEqual(fakeResponse);
            expect(mockRecommendationsService.getRecommendations).toHaveBeenCalledTimes(1);
            expect(mockRecommendationsService.getRecommendations).toHaveBeenCalledWith({
                type: undefined,
                sort: undefined,
            });
        });

        it('should return filtered recommendations when type is provided', async () => {
            const fakeResponse = {
                recommendations: [
                    {
                        id: 'rec-1',
                        clientId: 'client-1',
                        projectId: null,
                        type: 'high_potential_lead',
                        score: 92,
                        summary: 'Strong lead based on recent engagement and fit.',
                        reasons: ['Recent interaction', 'Strong service fit'],
                        suggestedAction: 'Schedule a discovery call',
                        priority: 'high',
                        rankingPosition: 1,
                        createdAt: '2026-04-12T12:00:00.000Z',
                    },
                ],
                total: 1,
            };

            mockRecommendationsService.getRecommendations.mockResolvedValue(fakeResponse);

            const result = await controller.getRecommendations('high_potential_lead', undefined);

            expect(result).toEqual(fakeResponse);
            expect(mockRecommendationsService.getRecommendations).toHaveBeenCalledWith({
                type: 'high_potential_lead',
                sort: undefined,
            });
        });

        it('should pass both type and sort query params to the service', async () => {
            const fakeResponse = {
                recommendations: [],
                total: 0,
            };

            mockRecommendationsService.getRecommendations.mockResolvedValue(fakeResponse);

            const result = await controller.getRecommendations(
                'upsell_opportunity',
                'score_desc',
            );

            expect(result).toEqual(fakeResponse);
            expect(mockRecommendationsService.getRecommendations).toHaveBeenCalledWith({
                type: 'upsell_opportunity',
                sort: 'score_desc',
        });
    });

    it('should return an empty recommendations array when no data exists', async () => {
      const fakeResponse = {
        recommendations: [],
        total: 0,
      };

      mockRecommendationsService.getRecommendations.mockResolvedValue(fakeResponse);

      const result = await controller.getRecommendations(undefined, undefined);

      expect(result).toEqual(fakeResponse);
      expect(mockRecommendationsService.getRecommendations).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', async () => {
      mockRecommendationsService.getRecommendations.mockRejectedValue(
        new Error('Database unavailable'),
      );

      await expect(
        controller.getRecommendations(undefined, undefined),
      ).rejects.toThrow('Database unavailable');
    });
  });
});