import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsSupabaseService } from './recommendations.supabase.service';

@Module({
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    RecommendationsSupabaseService,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}