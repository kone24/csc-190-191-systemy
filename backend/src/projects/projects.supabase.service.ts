import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ProjectsSupabaseService {
    private readonly logger = new Logger(ProjectsSupabaseService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findAll(): Promise<{ project_id: string; name: string }[]> {
        const { data, error } = await this.supabase
            .from('project')
            .select('project_id, name')
            .order('name', { ascending: true });

        if (error) {
            this.logger.error('Error fetching projects:', error);
            throw new Error(`Failed to fetch projects: ${error.message}`);
        }

        return data || [];
    }
}
