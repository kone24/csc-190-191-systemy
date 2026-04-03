import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [LeadsController],
    providers: [LeadScoringPipelineService],
    exports: [LeadScoringPipelineService],
})
export class LeadsModule {}