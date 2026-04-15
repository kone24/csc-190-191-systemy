import { Controller, Get } from '@nestjs/common';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';

@Controller('leads')
export class LeadsController {
    constructor(
        private readonly leadScoringPipelineService: LeadScoringPipelineService,
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
}