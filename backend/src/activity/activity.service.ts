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

    // Tasks assigned to this user — order by when the task was created
    const { data: tasks } = await this.supabase
      .from('task')
      .select('task_id, title, status, created_at')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(10);

    for (const t of tasks ?? []) {
      events.push({
        type: 'task',
        description: `Task assigned: "${t.title}" — ${t.status ?? 'open'}`,
        timestamp: t.created_at ?? null,
      });
    }

    // Projects owned by this user — order by when the project was created
    const { data: projects } = await this.supabase
      .from('project')
      .select('project_id, name, status, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(5);

    for (const p of projects ?? []) {
      events.push({
        type: 'project',
        description: `Project created: "${p.name}" — ${p.status ?? 'active'}`,
        timestamp: p.created_at ?? null,
      });
    }

    // Invoices — admin/manager only — order by when the invoice was created
    if (isPrivileged) {
      const { data: invoices } = await this.supabase
        .from('invoice')
        .select('invoice_id, invoice_number, status, created_at')
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(5);

      for (const inv of invoices ?? []) {
        events.push({
          type: 'invoice',
          description: `Invoice #${inv.invoice_number ?? inv.invoice_id} — ${inv.status}`,
          timestamp: inv.created_at ?? null,
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
