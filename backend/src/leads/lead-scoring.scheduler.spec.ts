import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LeadScoringScheduler } from './lead-scoring.scheduler';
import { LeadScoringService } from './lead-scoring.service';

describe('LeadScoringScheduler', () => {
  let scheduler: LeadScoringScheduler;

  const mockRunScoring = jest.fn();

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringScheduler,
        {
          provide: LeadScoringService,
          useValue: {
            runScoring: mockRunScoring,
          },
        },
      ],
    }).compile();

    scheduler = module.get<LeadScoringScheduler>(LeadScoringScheduler);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should run lead scoring daily and log scored lead count', async () => {
    mockRunScoring.mockResolvedValue([
      { clientId: '1', score: 80 },
      { clientId: '2', score: 65 },
      { clientId: '3', score: 40 },
    ]);

    await scheduler.runDailyLeadScoring();

    expect(mockRunScoring).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Starting scheduled daily lead scoring run',
    );
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Scheduled daily lead scoring finished. 3 leads were scored',
    );
  });

  it('should surface errors from scoring execution', async () => {
    mockRunScoring.mockRejectedValue(new Error('scoring failed'));

    await expect(scheduler.runDailyLeadScoring()).rejects.toThrow(
      'scoring failed',
    );
    expect(mockRunScoring).toHaveBeenCalledTimes(1);
  });
});
