import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized for UsersService');
    }

    async updateRole(userId: string, role: string): Promise<void> {
        const { error } = await this.supabase
            .from('users')
            .update({ role })
            .eq('user_id', userId);

        if (error) {
            this.logger.error('Error updating user role:', error);
            throw new Error(`Failed to update user role: ${error.message}`);
        }
    }

    async updateTimezone(userId: string, timezone: string): Promise<void> {
        const { error } = await this.supabase
            .from('users')
            .update({ timezone })
            .eq('user_id', userId);

        if (error) {
            this.logger.error('Error updating user timezone:', error);
            throw new Error(`Failed to update user timezone: ${error.message}`);
        }
    }

    async getTimezone(userId: string): Promise<string> {
        const { data, error } = await this.supabase
            .from('users')
            .select('timezone')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            this.logger.error('Error fetching user timezone:', error);
            return 'America/Los_Angeles';
        }

        return data?.timezone ?? 'America/Los_Angeles';
    }

    async findAll(): Promise<UserResponseDto[]> {
        try {
            const { data: users, error } = await this.supabase
                .from('users')
                .select('user_id, name, email, role');

            if (error) {
                this.logger.error('Error fetching users:', error);
                throw new Error(`Failed to fetch users: ${error.message}`);
            }

            return (users ?? []).map(u => ({
                user_id: u.user_id,
                name: u.name,
                email: u.email,
                role: u.role,
            }));
        } catch (error) {
            this.logger.error('Error in findAll method:', error);
            throw error;
        }
    }
}
