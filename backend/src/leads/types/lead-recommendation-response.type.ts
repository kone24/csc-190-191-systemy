export type LeadRecommendationResponse = {
  clientId: string;
  clientName: string;
  score: number | null;
  recommendation: string | null;
  details: Record<string, unknown> | null;
  updatedAt: string | null;
};
