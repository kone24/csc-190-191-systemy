import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ActivityEvent {
  type: 'task' | 'project' | 'invoice';
  description: string;
  timestamp: string | null;
}

@Injectable()
export class ActivityService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async getFeed(email: string): Promise<ActivityEvent[]> {
    // Resolve user_id and role from email
    const { data: userRow } = await this.supabase
      .from('users')
      .select('user_id, role')
      .eq('email', email.toLowerCase())
      .single();

    if (!userRow) return [];

    const userId: string = userRow.user_id;
    const isPrivileged = ['admin', 'manager'].includes(userRow.role ?? '');
    const events: ActivityEvent[] = [];

    // Tasks assigned to this user — use due_date as timestamp proxy
    const { data: tasks } = await this.supabase
      .from('task')
      .select('task_id, title, status, due_date')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: false, nullsFirst: false })
      .limit(10);

    for (const t of tasks ?? []) {
      events.push({
        type: 'task',
        description: `Task: "${t.title}" — ${t.status ?? 'open'}`,
        timestamp: t.due_date ?? null,
      });
    }

    // Projects owned by this user — use start_date as timestamp proxy
    const { data: projects } = await this.supabase
      .from('project')
      .select('project_id, name, status, start_date')
      .eq('owner_id', userId)
      .order('start_date', { ascending: false, nullsFirst: false })
      .limit(5);

    for (const p of projects ?? []) {
      events.push({
        type: 'project',
        description: `Project: "${p.name}" — ${p.status ?? 'active'}`,
        timestamp: p.start_date ?? null,
      });
    }

    // Invoices — admin/manager only — use date_issued as timestamp proxy
    if (isPrivileged) {
      const { data: invoices } = await this.supabase
        .from('invoice')
        .select('invoice_id, invoice_number, status, date_issued')
        .order('date_issued', { ascending: false, nullsFirst: false })
        .limit(5);

      for (const inv of invoices ?? []) {
        events.push({
          type: 'invoice',
          description: `Invoice #${inv.invoice_number ?? inv.invoice_id} — ${inv.status}`,
          timestamp: inv.date_issued ?? null,
        });
      }
    }

    // Sort by timestamp descending, nulls last, take top 10
    return events
      .sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, 10);
  }
}
