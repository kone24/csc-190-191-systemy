import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LeadScoringInput } from './types/lead-scoring-input.type';

type ClientRow = {
    id: string;
    budget_range: string | null;
    project_timeline: string | null;
    services_needed: unknown;
    preferred_contact_method: string | null;
    relationship_status: string | null;
};

type InteractionRow = {
    interaction_id: string;
    client_id: string;
    type: string;
    started_at: string | null;
};

type ReminderRow = {
    id: string;
    client_id: string | null;
    remind_at: string;
    status: string | null;
};

@Injectable()
export class LeadScoringPipelineService {
    private readonly logger = new Logger(LeadScoringPipelineService.name);

    constructor(private readonly supabaseService: SupabaseService) {}

    async buildInputs(): Promise<LeadScoringInput[]> {
        const supabase = this.supabaseService.getClient();

        const [
            { data: clients, error: clientsError },
            { data: interactions, error: interactionsError },
            { data: reminders, error: remindersError },
        ] = await Promise.all([
            supabase
                .from('clients')
                .select(
                    'id, budget_range, project_timeline, services_needed, preferred_contact_method, relationship_status',
                ),
            supabase
                .from('interaction')
                .select('interaction_id, client_id, type, started_at'),
            supabase
                .from('reminders')
                .select('id, client_id, remind_at, status'),
        ]);

        if (clientsError) {
            this.logger.error(`Failed to fetch clients: ${clientsError.message}`);
            throw new InternalServerErrorException('Failed to fetch clients');
        }

        if (interactionsError) {
            this.logger.error(`Failed to fetch interactions: ${interactionsError.message}`);
            throw new InternalServerErrorException('Failed to fetch interactions');
        }

        if (remindersError) {
            this.logger.error(`Failed to fetch reminders: ${remindersError.message}`);
            throw new InternalServerErrorException('Failed to fetch reminders');
        }

        const clientRows = (clients ?? []) as ClientRow[];
        const interactionRows = (interactions ?? []) as InteractionRow[];
        const reminderRows = (reminders ?? []) as ReminderRow[];

        const now = new Date();

        const inputs = clientRows.map((client) => {
            const clientInteractions = interactionRows.filter(
                (interaction) => interaction.client_id === client.id,
            );

            const clientReminders = reminderRows.filter(
                (reminder) => reminder.client_id === client.id,
            );

            const interactionCount = clientInteractions.length;
            const meetingCount = clientInteractions.filter(
                (interaction) => interaction.type?.toLowerCase() === 'meeting',
            ).length;
            const emailCount = clientInteractions.filter(
                (interaction) => interaction.type?.toLowerCase() === 'email',
            ).length;

            const lastInteractionAt =
                this.getMostRecentInteractionDate(clientInteractions);
            
            const activeReminderStatuses = new Set(['PENDING', 'SCHEDULED']);
            const hasUpcomingReminder = clientReminders.some((reminder) => {
                if (!reminder.remind_at) return false;

                const remindAt = new Date(reminder.remind_at);
                if (Number.isNaN(remindAt.getTime())) return false;

                const status = reminder.status?.toUpperCase() ?? '';
                return remindAt > now && activeReminderStatuses.has(status);
            });

            return {
                clientId: client.id,
                budgetRange: client.budget_range ?? null,
                projectTimeline: client.project_timeline ?? null,
                servicesNeeded: this.normalServicesNeeded(client.services_needed),
                preferredContactMethod: client.preferred_contact_method ?? null,
                relationshipStatus: client.relationship_status ?? null,

                interactionCount,
                meetingCount,
                emailCount,
                lastInteractionAt,

                reminderCount: clientReminders.length,
                hasUpcomingReminder,
            };
        });

        this.logger.log(`Built lead scoring inputs for ${inputs.length} clients`);
        return inputs;
    }

    private normalServicesNeeded(value: unknown): string [] | null {
        if (!value) return null;

        if (Array.isArray(value)) {
            const cleaned = value
                .map((item) => String(item).trim())
                .filter(Boolean);
            return cleaned.length ? cleaned : null;
        }

        if (typeof value === 'object') {
            const flattened = Object.values(value as Record<string, unknown>)
                .flatMap((item) => (Array.isArray(item) ? item : [item]))
                .map((item) => String(item).trim())
                .filter(Boolean);

            return flattened.length ? flattened : null;
        }

        return null;
    }

    private getMostRecentInteractionDate(
        interactions: InteractionRow[],
    ): string | null {
        const validDates = interactions
            .map((interaction) => interaction.started_at)
            .filter((date): date is string => Boolean(date))
            .map((date) => new Date(date))
            .filter((date) => !Number.isNaN(date.getTime()))
            .sort((a, b) => b.getTime() - a.getTime());
        
        return validDates.length ? validDates[0].toISOString() : null;
    }
}