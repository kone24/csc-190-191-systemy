import { InternalServerErrorException } from '@nestjs/common';
import { LeadScoringService } from './lead-scoring.service';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('LeadScoringService - getLeadRecommendations', () => {
  let service: LeadScoringService;
  let pipelineService: jest.Mocked<LeadScoringPipelineService>;
  let supabaseService: jest.Mocked<SupabaseService>;

  let orderMock: jest.Mock;
  let eqMock: jest.Mock;
  let selectMock: jest.Mock;
  let fromMock: jest.Mock;

  beforeEach(() => {
    orderMock = jest.fn();
    eqMock = jest.fn().mockReturnValue({
      order: orderMock,
    });
    selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });
    fromMock = jest.fn().mockReturnValue({
      select: selectMock,
    });

    pipelineService = {
      buildInputs: jest.fn(),
    } as unknown as jest.Mocked<LeadScoringPipelineService>;

    supabaseService = {
      getClient: jest.fn().mockReturnValue({
        from: fromMock,
      }),
    } as unknown as jest.Mocked<SupabaseService>;

    service = new LeadScoringService(pipelineService, supabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return mapped lead recommendations sorted from the query', async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'client-1',
          score: 80,
          recommendation: 'High potential lead',
          details: {
            label: 'HIGH',
            breakdown: { budget: 30 },
          },
          updated_at: '2026-04-13T04:00:20.157764+00:00',
          clients: {
            business_name: 'Acme Corp',
            first_name: null,
            last_name: null,
          },
        },
        {
          id: 'client-2',
          score: 70,
          recommendation: 'Medium potential lead',
          details: {
            label: 'MEDIUM',
          },
          updated_at: '2026-04-13T04:00:20.157764+00:00',
          clients: {
            business_name: null,
            first_name: 'Jane',
            last_name: 'Smith',
          },
        },
      ],
      error: null,
    });

    const result = await service.getLeadRecommendations();

    expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith('ai_recommendation');
    expect(selectMock).toHaveBeenCalledWith(`
        id,
        score,
        recommendation,
        details,
        updated_at,
        clients (
          first_name,
          last_name,
          business_name
        )
      `);
    expect(eqMock).toHaveBeenCalledWith('type', 'lead_score');
    expect(orderMock).toHaveBeenCalledWith('score', { ascending: false });

    expect(result).toEqual([
      {
        clientId: 'client-1',
        clientName: 'Acme Corp',
        score: 80,
        recommendation: 'High potential lead',
        details: {
          label: 'HIGH',
          breakdown: { budget: 30 },
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
  });

  it('should fall back to client id when no client name exists', async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'client-3',
          score: 10,
          recommendation: 'Low potential lead',
          details: null,
          updated_at: null,
          clients: {
            business_name: null,
            first_name: null,
            last_name: null,
          },
        },
      ],
      error: null,
    });

    const result = await service.getLeadRecommendations();

    expect(result).toEqual([
      {
        clientId: 'client-3',
        clientName: 'client-3',
        score: 10,
        recommendation: 'Low potential lead',
        details: null,
        updatedAt: null,
      },
    ]);
  });

  it('should return empty array when no recommendations exist', async () => {
    orderMock.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await service.getLeadRecommendations();

    expect(result).toEqual([]);
  });

  it('should throw InternalServerErrorException when fetch fails', async () => {
    orderMock.mockResolvedValue({
      data: null,
      error: { message: 'fetch failed' },
    });

    await expect(service.getLeadRecommendations()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
