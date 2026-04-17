import { LeadsController } from './leads.controller';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { LeadScoringService } from './lead-scoring.service';

describe('LeadsController', () => {
  let controller: LeadsController;
  let pipelineService: jest.Mocked<LeadScoringPipelineService>;
  let scoringService: jest.Mocked<LeadScoringService>;

  beforeEach(() => {
    pipelineService = {
      buildInputs: jest.fn(),
    } as unknown as jest.Mocked<LeadScoringPipelineService>;

    scoringService = {
      runScoring: jest.fn(),
      getLeadRecommendations: jest.fn(),
      scoreLead: jest.fn(),
    } as unknown as jest.Mocked<LeadScoringService>;

    controller = new LeadsController(pipelineService, scoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return recommendations response for dashboard', async () => {
    scoringService.getLeadRecommendations.mockResolvedValue([
      {
        clientId: 'client-1',
        clientName: 'Acme Corp',
        score: 80,
        recommendation: 'High potential lead',
        details: {
          label: 'HIGH',
        },
        updatedAt: '2026-04-13T04:00:20.157764+00:00',
      },
      {
        clientId: 'client-2',
        clientName: 'Jane Smith',
        score: 70,
        recommendation: 'Medium potential lead',
        details: {
          label: 'MEDIUM',
        },
        updatedAt: '2026-04-13T04:00:20.157764+00:00',
      },
    ]);

    const result = await controller.getRecommendations();

    expect(scoringService.getLeadRecommendations).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      ok: true,
      count: 2,
      recommendations: [
        {
          clientId: 'client-1',
          clientName: 'Acme Corp',
          score: 80,
          recommendation: 'High potential lead',
          details: {
            label: 'HIGH',
          },
          updatedAt: '2026-04-13T04:00:20.157764+00:00',
        },
        {
          clientId: 'client-2',
          clientName: 'Jane Smith',
          score: 70,
          recommendation: 'Medium potential lead',
          details: {
            label: 'MEDIUM',
          },
          updatedAt: '2026-04-13T04:00:20.157764+00:00',
        },
      ],
    });
  });

  it('should handle empty recommendations', async () => {
    scoringService.getLeadRecommendations.mockResolvedValue([]);

    const result = await controller.getRecommendations();

    expect(result).toEqual({
      ok: true,
      count: 0,
      recommendations: [],
    });
  });
});
