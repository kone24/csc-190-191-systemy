import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class RbacSupabaseService {
  private readonly logger = new Logger(RbacSupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided');
    }

    this.supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    this.logger.log('Supabase admin client initialized (RBAC)');
  }

  get db(): SupabaseClient {
    return this.supabase;
  }
}