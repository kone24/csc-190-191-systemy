import { Injectable } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersSupabaseService } from './reminders.supabase.service';
import { calculateRemindAt } from './utils/reminder-date.util';

@Injectable()
export class RemindersService {
  constructor(
    private readonly remindersSupabaseService: RemindersSupabaseService,
  ) {}

  async create(dto: CreateReminderDto) {
    const remindAt = calculateRemindAt(
      dto.interaction_date,
      dto.days_after_interaction,
      dto.remind_at,
    );

    const now = new Date().toISOString();

    return this.remindersSupabaseService.createReminder({
      client_id: dto.client_id ?? null,
      interaction_id: dto.interaction_id ?? null,
      title: dto.title,
      description: dto.description ?? null,
      remind_at: remindAt,
      timezone: dto.timezone,
      days_after_interaction: dto.days_after_interaction ?? null,
      status: 'PENDING',
      sync_to_google: dto.sync_to_google ?? false,
      google_event_id: null,
      assigned_to: dto.assigned_to ?? null,
      admin_override: dto.admin_override ?? false,
      created_at: now,
      updated_at: now,
    });
  }

  async findAll() {
    return this.remindersSupabaseService.getAllReminders();
  }

  async findByClient(clientId: string) {
    return this.remindersSupabaseService.getRemindersByClient(clientId);
  }

  async update(id: string, dto: UpdateReminderDto) {
    const payload: Record<string, any> = {
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (
      dto.remind_at ||
      dto.interaction_date ||
      dto.days_after_interaction !== undefined
    ) {
      payload.remind_at = calculateRemindAt(
        dto.interaction_date,
        dto.days_after_interaction,
        dto.remind_at,
      );
    }

    // normalize status if provided
    if (typeof payload.status === 'string') {
      payload.status = payload.status.toUpperCase();
    }

    return this.remindersSupabaseService.updateReminder(id, payload);
  }

  async getDueReminders() {
  const now = new Date();
  const reminders = await this.remindersSupabaseService.getAllReminders();

  return reminders.filter((r: any) => {
    if (!r.remind_at) return false;

    return (
      new Date(r.remind_at).getTime() <= now.getTime() &&
      r.banner_shown === false
    );
  });
}

  async listDue(now = new Date()) {
    return this.getDueReminders();
  }

  // with current enum, keep processing-state reminders as PENDING
  async markSending(id: string) {
    return this.remindersSupabaseService.updateReminder(id, {
      updated_at: new Date().toISOString(),
    });
  }

  async markSent(id: string) {
    return this.remindersSupabaseService.updateReminder(id, {
      status: 'COMPLETED',
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
  }

  async markFailed(id: string, err: unknown) {
    return this.remindersSupabaseService.updateReminder(id, {
      status: 'PENDING',
      last_error: err instanceof Error ? err.message : String(err),
      updated_at: new Date().toISOString(),
    });
  }

  async markCompleted(id: string) {
  return this.remindersSupabaseService.updateReminder(id, {
    status: 'COMPLETED',
    banner_shown: true,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

  async createFollowUpReminder(args: {
  userId: string;
  clientId: string;
  interactionId: string;
  followUpDays: number;
  baseTimeISO: string;
  sendEmail: boolean;
  sendDashboard: boolean;
}) {
  const base = new Date(args.baseTimeISO);
  const due = new Date(
    base.getTime() + args.followUpDays * 24 * 60 * 60 * 1000,
  );

  const now = new Date().toISOString();

  return this.remindersSupabaseService.createReminder({
  assigned_to: args.userId,
  client_id: args.clientId,
  interaction_id: args.interactionId || null,
  title: `Follow up with client ${args.clientId}`,
  description: `Follow-up reminder for interaction ${args.interactionId ?? 'none'}`,
  remind_at: due.toISOString(),
  timezone: 'America/Los_Angeles',
  days_after_interaction: args.followUpDays,
  status: 'PENDING',
  sync_to_google: false,
  google_event_id: null,
  admin_override: false,
  created_at: now,
  updated_at: now,
  send_email: args.sendEmail,
  email_sent: false,
  banner_shown: false,
});
}
}