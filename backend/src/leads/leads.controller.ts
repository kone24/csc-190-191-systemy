import { Controller, Get, Post } from '@nestjs/common';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { LeadScoringService } from './lead-scoring.service';

@Controller('leads')
export class LeadsController {
    constructor(
        private readonly leadScoringPipelineService: LeadScoringPipelineService,
        private readonly leadScoringService: LeadScoringService,
    ) {}

    @Get('pipeline/test')
    async testPipeline() {
        const inputs = await this.leadScoringPipelineService.buildInputs();

        return {
            ok: true,
            count: inputs.length,
            inputs,
        };
    }

    @Post('score/run')
    async runScoring() {
        const results = await this.leadScoringService.runScoring();

        return {
        ok: true,
        count: results.length,
        results,
        };
    }

    @Get('recommendations')
    async getRecommendations() {
    const recommendations =
        await this.leadScoringService.getLeadRecommendations();

    return {
        ok: true,
        count: recommendations.length,
        recommendations,
    };
    }
}