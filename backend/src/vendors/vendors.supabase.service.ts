import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsSupabaseService {
    private readonly logger = new Logger(VendorsSupabaseService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized for vendors');
    }

    async create(vendorData: Partial<Vendor>): Promise<Vendor> {
        const { data, error } = await this.supabase
            .from('vendors')
            .insert([vendorData])
            .select('*, project(project_id, name)')
            .single();

        if (error) {
            this.logger.error('Error creating vendor:', error);
            throw new Error(`Failed to create vendor: ${error.message}`);
        }

        return data;
    }

    async findAll(): Promise<Vendor[]> {
        const { data, error } = await this.supabase
            .from('vendors')
            .select('*, project(project_id, name)')
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error('Error fetching vendors:', error);
            throw new Error(`Failed to fetch vendors: ${error.message}`);
        }

        return data || [];
    }

    async findOne(id: string): Promise<Vendor> {
        const { data, error } = await this.supabase
            .from('vendors')
            .select('*, project(project_id, name)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error(`Vendor with ID ${id} not found`);
            }
            throw new Error(`Failed to fetch vendor: ${error.message}`);
        }

        return data;
    }

    async update(id: string, updateData: Partial<Vendor>): Promise<Vendor> {
        const { data, error } = await this.supabase
            .from('vendors')
            .update(updateData)
            .eq('id', id)
            .select('*, project(project_id, name)')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error(`Vendor with ID ${id} not found`);
            }
            throw new Error(`Failed to update vendor: ${error.message}`);
        }

        this.logger.log(`Vendor updated with ID: ${id}`);
        return data;
    }

    async remove(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('vendors')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete vendor: ${error.message}`);
        }

        this.logger.log(`Vendor deleted with ID: ${id}`);
    }

    async search(term: string): Promise<Vendor[]> {
        const { data, error } = await this.supabase
            .from('vendors')
            .select('*, project(project_id, name)')
            .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%,business_name.ilike.%${term}%`)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Search failed: ${error.message}`);
        }

        return data || [];
    }
}
