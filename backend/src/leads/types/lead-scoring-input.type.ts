export type LeadScoringInput = {
    clientId: string;
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