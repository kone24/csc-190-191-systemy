import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuditEntry {
  audit_id: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  performed_by: string | null;
  diff: Record<string, { old: unknown; new: unknown }> | null;
  created_at: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
    }

    this.supabase = createClient(url, key);
  }

  async log(
    entityType: string,
    entityId: string,
    action: 'create' | 'update' | 'delete',
    diff: Record<string, { old: unknown; new: unknown }> | null,
    performedBy?: string,
  ): Promise<void> {
    const { error } = await this.supabase.from('change_audit').insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      performed_by: performedBy || null,
      diff,
    });

    if (error) {
      this.logger.error(`Failed to write audit log: ${error.message}`, error);
    }
  }

  async getHistory(
    entityType: string,
    entityId: string,
  ): Promise<AuditEntry[]> {
    const { data, error } = await this.supabase
      .from('change_audit')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to read audit log: ${error.message}`, error);
      return [];
    }

    return data || [];
  }
}
