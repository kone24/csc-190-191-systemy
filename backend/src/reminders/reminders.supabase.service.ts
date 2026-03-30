import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class RemindersSupabaseService {
  private readonly logger = new Logger(RemindersSupabaseService.name);
  private readonly supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
    }

    this.supabase = createClient(url, key);
  }

  async createReminder(payload: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('reminders')
      .insert(payload)
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating reminder', error);
      throw new Error(`Failed to create reminder: ${error.message}`);
    }

    return data;
  }

  async updateReminder(id: string, payload: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('reminders')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating reminder', error);
      throw new Error(`Failed to update reminder: ${error.message}`);
    }

    return data;
  }

  async getAllReminders() {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }

    return data ?? [];
  }

  async getRemindersByClient(clientId: string) {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('client_id', clientId)
      .order('remind_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch client reminders: ${error.message}`);
    }

    return data ?? [];
  }

  async getDueReminders(nowIso: string) {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .lte('remind_at', nowIso)
      .eq('status', 'PENDING')
      .order('remind_at', { ascending: true });

    if (error) {
      this.logger.error('Error fetching due reminders', error);
      throw new Error(`Failed to fetch due reminders: ${error.message}`);
    }

    return data ?? [];
  }
}