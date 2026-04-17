import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
// import { SupabaseAuthGuard } from '../auth/supabase-jwt.guard'; if we decide to use supabase auth later
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService,
        
    ) {}

    // @UseGuards(SupabaseAuthGuard)
    @Get()
    async getRecommendations(
        @Query('type') type?: string,
        @Query('sort') sort?: string,
    ) {
        return this.recommendationsService.getRecommendations({
            type,
            sort,
        });
    }
}