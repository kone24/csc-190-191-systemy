import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadScoringService } from './lead-scoring.service';

@Injectable()
export class LeadScoringScheduler {
    private readonly logger = new Logger(LeadScoringScheduler.name);

    constructor(
        private readonly leadScoringService: LeadScoringService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'UTC' })
    async runDailyLeadScoring() {
        this.logger.log('Starting scheduled daily lead scoring run');
        const results = await this.leadScoringService.runScoring();
        this.logger.log(
            `Scheduled daily lead scoring finished. ${results.length} leads were scored`,
        );
    }
}