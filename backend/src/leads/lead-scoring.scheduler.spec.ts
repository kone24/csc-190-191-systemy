import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LeadScoringScheduler } from './lead-scoring.scheduler';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';

describe('LeadScoringScheduler', () => {
  let scheduler: LeadScoringScheduler;

  const mockBuildInputs = jest.fn();

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadScoringScheduler,
        {
          provide: LeadScoringPipelineService,
          useValue: {
            buildInputs: mockBuildInputs,
          },
        },
      ],
    }).compile();

    scheduler = module.get<LeadScoringScheduler>(LeadScoringScheduler);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should run lead pipeline daily and log prepared input count', async () => {
    mockBuildInputs.mockResolvedValue([
      { clientId: '1' },
      { clientId: '2' },
      { clientId: '3' },
    ]);

    await scheduler.runDailyLeadScoring();

    expect(mockBuildInputs).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Starting scheduled daily lead scoring run',
    );
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Scheduled daily lead scoring finished. 3 lead inputs were prepared',
    );
  });

  it('should surface errors from pipeline execution', async () => {
    mockBuildInputs.mockRejectedValue(new Error('pipeline failed'));

    await expect(scheduler.runDailyLeadScoring()).rejects.toThrow(
      'pipeline failed',
    );
    expect(mockBuildInputs).toHaveBeenCalledTimes(1);
  });
});
