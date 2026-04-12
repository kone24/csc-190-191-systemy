import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Logger } from '@nestjs/common';

describe('LeadScoringPipelineService', () => {
  let service: LeadScoringPipelineService;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  const mockClientRows = [
    {
      id: 'client-1',
      budget_range: '$5,000 - $10,000',
      project_timeline: 'Q3 2025',
      services_needed: ['Web Design', 'SEO'],
      preferred_contact_method: 'Email',
      relationship_status: 'Prospect',
    },
    {
      id: 'client-2',
      budget_range: null,
      project_timeline: null,
      services_needed: null,
      preferred_contact_method: null,
      relationship_status: null,
    },
  ];

  const mockInteractionRows = [
    {
      interaction_id: 'int-1',
      client_id: 'client-1',
      type: 'meeting',
      started_at: '2026-03-01T10:00:00.000Z',
    },
    {
      interaction_id: 'int-2',
      client_id: 'client-1',
      type: 'email',
      started_at: '2026-03-05T10:00:00.000Z',
    },
    {
      interaction_id: 'int-3',
      client_id: 'client-1',
      type: 'call',
      started_at: '2026-02-20T10:00:00.000Z',
    },
  ];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);

  const mockReminderRows = [
    {
      id: 'rem-1',
      client_id: 'client-1',
      remind_at: futureDate.toISOString(),
      status: 'PENDING',
    },
    {
      id: 'rem-2',
      client_id: 'client-1',
      remind_at: pastDate.toISOString(),
      status: 'DONE',
    },
    {
      id: 'rem-3',
      client_id: 'client-2',
      remind_at: futureDate.toISOString(),
      status: 'CANCELLED',
    },
  ];

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringPipelineService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<LeadScoringPipelineService>(
      LeadScoringPipelineService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build lead scoring inputs from clients, interactions, and reminders', async () => {
    mockSupabaseClient.from
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: mockClientRows,
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: mockInteractionRows,
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: mockReminderRows,
          error: null,
        }),
      }));

    const result = await service.buildInputs();

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      clientId: 'client-1',
      budgetRange: '$5,000 - $10,000',
      projectTimeline: 'Q3 2025',
      servicesNeeded: ['Web Design', 'SEO'],
      preferredContactMethod: 'Email',
      relationshipStatus: 'Prospect',
      interactionCount: 3,
      meetingCount: 1,
      emailCount: 1,
      lastInteractionAt: '2026-03-05T10:00:00.000Z',
      reminderCount: 2,
      hasUpcomingReminder: true,
    });

    expect(result[1]).toEqual({
      clientId: 'client-2',
      budgetRange: null,
      projectTimeline: null,
      servicesNeeded: null,
      preferredContactMethod: null,
      relationshipStatus: null,
      interactionCount: 0,
      meetingCount: 0,
      emailCount: 0,
      lastInteractionAt: null,
      reminderCount: 1,
      hasUpcomingReminder: false,
    });
  });

  it('should return default values when a client has no interactions or reminders', async () => {
    mockSupabaseClient.from
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'client-3',
              budget_range: null,
              project_timeline: null,
              services_needed: null,
              preferred_contact_method: null,
              relationship_status: null,
            },
          ],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }));

    const result = await service.buildInputs();

    expect(result).toEqual([
      {
        clientId: 'client-3',
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
      },
    ]);
  });

  it('should normalize object-based services_needed into a string array', async () => {
    mockSupabaseClient.from
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'client-4',
              budget_range: null,
              project_timeline: null,
              services_needed: {
                primary: 'Branding',
                secondary: ['SEO', 'Web Design'],
              },
              preferred_contact_method: null,
              relationship_status: null,
            },
          ],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }));

    const result = await service.buildInputs();

    expect(result[0].servicesNeeded).toEqual([
      'Branding',
      'SEO',
      'Web Design',
    ]);
  });

  it('should throw if fetching clients fails', async () => {
    mockSupabaseClient.from
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'clients failed' },
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }));

    await expect(service.buildInputs()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should throw if fetching interactions fails', async () => {
    mockSupabaseClient.from
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: mockClientRows,
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'interactions failed' },
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }));

    await expect(service.buildInputs()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should throw if fetching reminders fails', async () => {
    mockSupabaseClient.from
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: mockClientRows,
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: mockInteractionRows,
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'reminders failed' },
        }),
      }));

    await expect(service.buildInputs()).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});