import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LeadScoringPipelineService } from './lead-scoring-pipeline.service';
import { LeadScoringInput } from './types/lead-scoring-input.type';

type LeadScoreLabel = 'LOW' | 'MEDIUM' | 'HIGH';

type ScoreBreakdown = {
  budget: number;
  timeline: number;
  services: number;
  relationship: number;
  interactions: number;
  meetings: number;
  emails: number;
  recency: number;
  reminders: number;
};

type LeadScoreResult = {
  clientId: string;
  score: number;
  label: LeadScoreLabel;
  recommendation: string;
  details: {
    scoringModel: string;
    breakdown: ScoreBreakdown;
    inputs: {
      budgetRange: string | null;
      projectTimeline: string | null;
      servicesNeeded: string[] | null;
      preferredContactMethod: string | null;
      relationshipStatus: string | null;
      interactionCount: number;
      meetingCount: number;
      emailCount: number;
      lastInteractionAt: string | null;
      reminderCount: number;
      hasUpcomingReminder: boolean;
    };
  };
};

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);
  private readonly scoringModel = 'weighted_rules_v1';

  constructor(
    private readonly pipelineService: LeadScoringPipelineService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async runScoring(): Promise<LeadScoreResult[]> {
    const inputs = await this.pipelineService.buildInputs();
    const results = inputs.map((input) => this.scoreLead(input));

    await this.storeResults(results);

    this.logger.log(`Scored ${results.length} leads`);
    return results;
  }

  scoreLead(input: LeadScoringInput): LeadScoreResult {
    const breakdown: ScoreBreakdown = {
      budget: this.scoreBudget(input.budgetRange),
      timeline: this.scoreTimeline(input.projectTimeline),
      services: this.scoreServices(input.servicesNeeded),
      relationship: this.scoreRelationship(input.relationshipStatus),
      interactions: this.scoreInteractions(input.interactionCount),
      meetings: this.scoreMeetings(input.meetingCount),
      emails: this.scoreEmails(input.emailCount),
      recency: this.scoreRecency(input.lastInteractionAt),
      reminders: this.scoreReminders(
        input.reminderCount,
        input.hasUpcomingReminder,
      ),
    };

    let score = this.calculateTotalScore(breakdown);
    score = this.clampScore(score);

    const label = this.getLabel(score);
    const recommendation = this.getRecommendationText(label);

    return {
      clientId: input.clientId,
      score,
      label,
      recommendation,
      details: {
        scoringModel: this.scoringModel,
        breakdown,
        inputs: {
          budgetRange: input.budgetRange,
          projectTimeline: input.projectTimeline,
          servicesNeeded: input.servicesNeeded,
          preferredContactMethod: input.preferredContactMethod,
          relationshipStatus: input.relationshipStatus,
          interactionCount: input.interactionCount,
          meetingCount: input.meetingCount,
          emailCount: input.emailCount,
          lastInteractionAt: input.lastInteractionAt,
          reminderCount: input.reminderCount,
          hasUpcomingReminder: input.hasUpcomingReminder,
        },
      },
    };
  }

  private scoreBudget(budgetRange: string | null): number {
    const budget = this.normalizeText(budgetRange);
    if (!budget || this.isPlaceholderValue(budget)) {
      return 0;
    }

    if (budget.includes('10,000') || budget.includes('10000')) {
      return 30;
    }

    if (budget.includes('5,000') || budget.includes('5000')) {
      return 20;
    }

    return 10;
  }

  private scoreTimeline(projectTimeline: string | null): number {
    const timeline = this.normalizeText(projectTimeline);
    if (!timeline || this.isPlaceholderValue(timeline)) {
      return 0;
    }

    if (
      timeline.includes('immediate') ||
      timeline.includes('asap') ||
      timeline.includes('urgent')
    ) {
      return 25;
    }

    if (
      timeline.includes('q1') ||
      timeline.includes('q2') ||
      timeline.includes('q3') ||
      timeline.includes('q4') ||
      timeline.includes('month')
    ) {
      return 15;
    }

    return 5;
  }

  private scoreServices(servicesNeeded: string[] | null): number {
    const serviceCount = servicesNeeded?.length ?? 0;

    if (serviceCount >= 3) {
      return 15;
    }

    if (serviceCount >= 1) {
      return 10;
    }

    return 0;
  }

  private scoreRelationship(relationshipStatus: string | null): number {
    const status = this.normalizeText(relationshipStatus);
    if (!status) {
      return 0;
    }

    switch (status) {
      case 'interested':
        return 15;
      case 'prospect':
        return 10;
      case 'client':
        return 5;
      default:
        return 0;
    }
  }

  private scoreInteractions(interactionCount: number): number {
    if (interactionCount >= 5) {
      return 15;
    }

    if (interactionCount >= 2) {
      return 10;
    }

    if (interactionCount >= 1) {
      return 5;
    }

    return 0;
  }

  private scoreMeetings(meetingCount: number): number {
    if (meetingCount >= 2) {
      return 10;
    }

    if (meetingCount >= 1) {
      return 5;
    }

    return 0;
  }

  private scoreEmails(emailCount: number): number {
    if (emailCount >= 3) {
      return 5;
    }

    if (emailCount >= 1) {
      return 2;
    }

    return 0;
  }

  private scoreRecency(lastInteractionAt: string | null): number {
    const daysSinceLastInteraction = this.getDaysSince(lastInteractionAt);
    if (daysSinceLastInteraction === null) {
      return 0;
    }

    if (daysSinceLastInteraction <= 7) {
      return 10;
    }

    if (daysSinceLastInteraction <= 30) {
      return 5;
    }

    return 0;
  }

  private scoreReminders(
    reminderCount: number,
    hasUpcomingReminder: boolean,
  ): number {
    let points = 0;

    if (hasUpcomingReminder) {
      points += 5;
    }

    if (reminderCount >= 3) {
      points += 5;
    } else if (reminderCount >= 1) {
      points += 2;
    }

    return points;
  }

  private calculateTotalScore(breakdown: ScoreBreakdown): number {
    return Object.values(breakdown).reduce((total, points) => total + points, 0);
  }

  private clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
  }

  private getLabel(score: number): LeadScoreLabel {
    if (score >= 75) {
      return 'HIGH';
    }

    if (score >= 40) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private getRecommendationText(label: LeadScoreLabel): string {
    switch (label) {
      case 'HIGH':
        return 'High potential lead';
      case 'MEDIUM':
        return 'Medium potential lead';
      default:
        return 'Low potential lead';
    }
  }

  private getDaysSince(dateString: string | null): number | null {
    if (!dateString) {
      return null;
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private normalizeText(value: string | null): string | null {
    const normalized = value?.trim().toLowerCase() ?? null;
    return normalized || null;
  }

  private isPlaceholderValue(value: string): boolean {
    return (
      value === 'to be determined' ||
      value === 'tbd' ||
      value === 'unknown'
    );
  }

  private async storeResults(results: LeadScoreResult[]): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const timestamp = new Date().toISOString();

    const payload = results.map((result) => ({
      id: result.clientId,
      project_id: null,
      type: 'lead_score',
      score: result.score,
      recommendation: result.recommendation,
      updated_at: timestamp,
      details: {
        label: result.label,
        ...result.details,
      },
    }));

    const { error } = await supabase
      .from('ai_recommendation')
      .upsert(payload, { onConflict: 'id,type' });

    if (error) {
      this.logger.error(`Failed to store lead scores: ${error.message}`);
      throw new InternalServerErrorException('Failed to store lead scores');
    }
  }
}
