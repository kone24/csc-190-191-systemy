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
      status: 'pending',
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

    if (dto.remind_at || dto.interaction_date || dto.days_after_interaction !== undefined) {
      payload.remind_at = calculateRemindAt(
        dto.interaction_date,
        dto.days_after_interaction,
        dto.remind_at,
      );
    }

    return this.remindersSupabaseService.updateReminder(id, payload);
  }

  async markCompleted(id: string) {
    return this.remindersSupabaseService.updateReminder(id, {
      status: 'completed',
      updated_at: new Date().toISOString(),
    });
  }
}