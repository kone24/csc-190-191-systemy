export interface RecommendationCardData {
    id: string;
    clientId?: string;
    projectId?: string;
    type: string;
    score: number;
    summary: string;
    reasons: string[];
    suggestedAction?: string;
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
}