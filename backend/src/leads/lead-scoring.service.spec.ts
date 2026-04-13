import { InternalServerErrorException } from '@nestjs/common';
import { LeadScoringService } from './lead-scoring.service';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LeadScoringInput } from './types/lead-scoring-input.type';

describe('LeadScoringService', () => {
  let service: LeadScoringService;
  let pipelineService: jest.Mocked<LeadScoringPipelineService>;
  let supabaseService: jest.Mocked<SupabaseService>;

  let upsertMock: jest.Mock;
  let fromMock: jest.Mock;
  let supabaseClientMock: { from: jest.Mock };

  beforeEach(() => {
    upsertMock = jest.fn();
    fromMock = jest.fn().mockReturnValue({
      upsert: upsertMock,
    });

    supabaseClientMock = {
      from: fromMock,
    };

    pipelineService = {
      buildInputs: jest.fn(),
    } as unknown as jest.Mocked<LeadScoringPipelineService>;

    supabaseService = {
      getClient: jest.fn().mockReturnValue(supabaseClientMock),
    } as unknown as jest.Mocked<SupabaseService>;

    service = new LeadScoringService(pipelineService, supabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const makeInput = (overrides: Partial<LeadScoringInput> = {}): LeadScoringInput => ({
    clientId: 'client-123',
    budgetRange: null,
    projectTimeline: null,
    servicesNeeded: null,
    preferredContactMethod: null,
    relationshipStatus: null,
    interactionCount: 0,
    meetingCount: 0,
    emailCount: 0,
    lastInteractionAt: null,
    reminderCount: 0,
    hasUpcomingReminder: false,
    ...overrides,
  });

  describe('scoreLead', () => {
    it('should return a HIGH score with detailed breakdown for a strong lead', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 2);

      const input = makeInput({
        budgetRange: '$10,000+',
        projectTimeline: 'Immediate',
        servicesNeeded: ['Web Design', 'SEO', 'Branding'],
        relationshipStatus: 'Prospect',
        interactionCount: 5,
        meetingCount: 2,
        emailCount: 3,
        lastInteractionAt: recentDate.toISOString(),
        reminderCount: 3,
        hasUpcomingReminder: true,
      });

      const result = service.scoreLead(input);

      expect(result.clientId).toBe('client-123');
      expect(result.score).toBe(100);
      expect(result.label).toBe('HIGH');
      expect(result.recommendation).toBe('High potential lead');

      expect(result.details).toEqual({
        scoringModel: 'weighted_rules_v1',
        breakdown: {
          budget: 30,
          timeline: 25,
          services: 15,
          relationship: 10,
          interactions: 15,
          meetings: 10,
          emails: 5,
          recency: 10,
          reminders: 10,
        },
        inputs: {
          budgetRange: '$10,000+',
          projectTimeline: 'Immediate',
          servicesNeeded: ['Web Design', 'SEO', 'Branding'],
          preferredContactMethod: null,
          relationshipStatus: 'Prospect',
          interactionCount: 5,
          meetingCount: 2,
          emailCount: 3,
          lastInteractionAt: recentDate.toISOString(),
          reminderCount: 3,
          hasUpcomingReminder: true,
        },
      });
    });

    it('should return a MEDIUM score for a moderate lead', () => {
      const input = makeInput({
        budgetRange: '$5,000 - $10,000',
        projectTimeline: 'Q3 2026',
        servicesNeeded: ['Web Design', 'SEO'],
        relationshipStatus: 'Interested',
      });

      const result = service.scoreLead(input);

      expect(result.score).toBe(65);
      expect(result.label).toBe('MEDIUM');
      expect(result.recommendation).toBe('Medium potential lead');
      expect(result.details.breakdown).toEqual({
        budget: 30,
        timeline: 15,
        services: 10,
        relationship: 10,
        interactions: 0,
        meetings: 0,
        emails: 0,
        recency: 0,
        reminders: 0,
      });
    });

    it('should return LOW for a null-heavy lead without crashing', () => {
      const input = makeInput();

      const result = service.scoreLead(input);

      expect(result.score).toBe(0);
      expect(result.label).toBe('LOW');
      expect(result.recommendation).toBe('Low potential lead');
      expect(result.details.breakdown).toEqual({
        budget: 0,
        timeline: 0,
        services: 0,
        relationship: 0,
        interactions: 0,
        meetings: 0,
        emails: 0,
        recency: 0,
        reminders: 0,
      });
    });

    it('should ignore placeholder values for budget and timeline', () => {
      const input = makeInput({
        budgetRange: 'To be determined',
        projectTimeline: 'TBD',
        servicesNeeded: ['General Services'],
      });

      const result = service.scoreLead(input);

      expect(result.score).toBe(10);
      expect(result.details.breakdown.budget).toBe(0);
      expect(result.details.breakdown.timeline).toBe(0);
      expect(result.details.breakdown.services).toBe(10);
    });

    it('should score relationship status only for exact supported values', () => {
      const prospectResult = service.scoreLead(
        makeInput({ relationshipStatus: 'Prospect' }),
      );
      const interestedResult = service.scoreLead(
        makeInput({ relationshipStatus: 'Interested' }),
      );
      const clientResult = service.scoreLead(
        makeInput({ relationshipStatus: 'Client' }),
      );
      const unknownResult = service.scoreLead(
        makeInput({ relationshipStatus: 'Relationship Status' }),
      );

      expect(prospectResult.details.breakdown.relationship).toBe(10);
      expect(interestedResult.details.breakdown.relationship).toBe(10);
      expect(clientResult.details.breakdown.relationship).toBe(5);
      expect(unknownResult.details.breakdown.relationship).toBe(0);
    });

    it('should award recency points for interactions within 7 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3);

      const result = service.scoreLead(
        makeInput({ lastInteractionAt: recentDate.toISOString() }),
      );

      expect(result.details.breakdown.recency).toBe(10);
    });

    it('should award recency points for interactions within 30 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);

      const result = service.scoreLead(
        makeInput({ lastInteractionAt: recentDate.toISOString() }),
      );

      expect(result.details.breakdown.recency).toBe(5);
    });

    it('should award no recency points for old interactions', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);

      const result = service.scoreLead(
        makeInput({ lastInteractionAt: oldDate.toISOString() }),
      );

      expect(result.details.breakdown.recency).toBe(0);
    });

    it('should return 0 recency points for invalid dates', () => {
      const result = service.scoreLead(
        makeInput({ lastInteractionAt: 'not-a-date' }),
      );

      expect(result.details.breakdown.recency).toBe(0);
    });

    it('should clamp score to 100 when component totals exceed 100', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 1);

      const input = makeInput({
        budgetRange: '$10,000+',
        projectTimeline: 'Immediate',
        servicesNeeded: ['A', 'B', 'C'],
        relationshipStatus: 'Prospect',
        interactionCount: 10,
        meetingCount: 5,
        emailCount: 10,
        lastInteractionAt: recentDate.toISOString(),
        reminderCount: 10,
        hasUpcomingReminder: true,
      });

      const result = service.scoreLead(input);

      expect(result.score).toBe(100);
      expect(result.label).toBe('HIGH');
    });
  });

  describe('runScoring', () => {
    it('should build inputs, score them, and upsert results', async () => {
      const fixedNow = new Date('2026-04-12T12:00:00.000Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      const inputs: LeadScoringInput[] = [
        makeInput({
          clientId: 'client-1',
          budgetRange: '$10,000+',
          projectTimeline: 'Immediate',
          servicesNeeded: ['Web Design', 'SEO', 'Branding'],
          relationshipStatus: 'Prospect',
        }),
        makeInput({
          clientId: 'client-2',
          interactionCount: 2,
          emailCount: 1,
        }),
      ];

      pipelineService.buildInputs.mockResolvedValue(inputs);
      upsertMock.mockResolvedValue({ error: null });

      const results = await service.runScoring();

      expect(pipelineService.buildInputs).toHaveBeenCalledTimes(1);
      expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith('ai_recommendation');
      expect(upsertMock).toHaveBeenCalledTimes(1);

      const [payload, options] = upsertMock.mock.calls[0];
      expect(options).toEqual({ onConflict: 'id,type' });
      expect(payload).toHaveLength(2);

      expect(payload[0]).toMatchObject({
        id: 'client-1',
        project_id: null,
        type: 'lead_score',
        score: 80,
        recommendation: 'High potential lead',
        updated_at: fixedNow.toISOString(),
    });

    expect(payload[0].details).toMatchObject({
        label: 'HIGH',
        scoringModel: 'weighted_rules_v1',
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        clientId: 'client-1',
        score: 80,
        label: 'HIGH',
      });
      expect(results[1]).toMatchObject({
        clientId: 'client-2',
        score: 12,
        label: 'LOW',
      });
    });

    it('should throw InternalServerErrorException when upsert fails', async () => {
      pipelineService.buildInputs.mockResolvedValue([makeInput()]);
      upsertMock.mockResolvedValue({
        error: { message: 'database write failed' },
      });

      await expect(service.runScoring()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );

      expect(upsertMock).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when pipeline returns no inputs', async () => {
      pipelineService.buildInputs.mockResolvedValue([]);
      upsertMock.mockResolvedValue({ error: null });

      const results = await service.runScoring();

      expect(results).toEqual([]);
      expect(upsertMock).toHaveBeenCalledWith([], { onConflict: 'id,type' });
    });
  });
});
