import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';

@Injectable()
export class LeadScoringScheduler {
    private readonly logger = new Logger(LeadScoringScheduler.name);

    constructor(
        private readonly leadScoringPipelineService: LeadScoringPipelineService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'UTC' })
    async runDailyLeadScoring() {
        this.logger.log('Starting scheduled daily lead scoring run');
        const inputs = await this.leadScoringPipelineService.buildInputs();
        this.logger.log(
            `Scheduled daily lead scoring finished. ${inputs.length} lead inputs were prepared`,
        );
    }
}