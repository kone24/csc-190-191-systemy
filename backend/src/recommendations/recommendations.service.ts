import { Injectable, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { RecommendationsSupabaseService } from '../recommendations/recommendations.supabase.service';

type RecommendationPriority = 'high' | 'medium' | 'low';

interface RecommendationFilters {
    type?: string;
    sort?: string;
}

@Injectable()
export class RecommendationsService {
    constructor(private readonly db: RecommendationsSupabaseService) {}

    private get supabase() {
        return this.db.db;
    }

    private derivePriority(score: number): RecommendationPriority {
        if (score >= 85) return 'high';
        if (score >= 65) return 'medium';
        return 'low';
    }

    async getRecommendations(filters?: RecommendationFilters) {
        // supabase user verification
        /* const { data: caller, error: callerError } = await this.supabase
            .from('users')
            .select('id, role, team_id')
            .eq('id', callerId)
            .single();
        
        if (callerError || !caller) {
            throw new ForbiddenException('Caller not found');
        }
        
        // Only allow admin and manager level to view recommendations
        if (caller.role !== 'admin' && caller.role !== 'manager') {
            throw new ForbiddenException(
                'Forbidden: Only admins or managers can view recommendations',
            );
        }
        */
        let query = this.supabase
            .from('ai_recommendation')
            .select('*');

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        // Default sort by highest score first
        query = query.order('score', { ascending: false });

        const { data, error } = await query;

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        const recommendations = (data ?? []).map((row: any, index: number) => ({
            id: row.recommendation_id,
            clientId: row.client_id ?? undefined,
            projectId: row.project_id ?? undefined,
            type: row.type,
            score: row.score,
            summary: row.recommendation,
            reasons: row.details?.reasons ?? [],
            suggestedAction: row.details?.suggestedAction ?? '',
            priority: row.details?.priority ?? this.derivePriority(row.score),
            rankingPosition: index + 1,
            createdAt: row.created_at,
        }));

        return {
            recommendations,
            total: recommendations.length,
        };
    }
}