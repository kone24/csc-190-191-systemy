import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { LeadScoringService } from './lead-scoring.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { LeadScoringScheduler } from './lead-scoring.scheduler';

@Module({
    imports: [SupabaseModule],
    controllers: [LeadsController],
    providers: [LeadScoringPipelineService, LeadScoringService, LeadScoringScheduler],
    exports: [LeadScoringPipelineService, LeadScoringService],
})
export class LeadsModule { }