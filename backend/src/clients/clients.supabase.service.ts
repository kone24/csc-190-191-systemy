import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client } from './entities/client.entity';
import { ClientProfileDto } from './dto/client-profile.dto';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class ClientsSupabaseService {
    private readonly logger = new Logger(ClientsSupabaseService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized');
    }

    async createClientTable(): Promise<void> {
        try {
            // Create clients table if it doesn't exist
            const { error } = await this.supabase.rpc('create_clients_table');
            if (error && !error.message.includes('already exists')) {
                throw error;
            }
            this.logger.log('Clients table ready');
        } catch (error) {
            this.logger.warn('Table creation handled by migrations or already exists');
        }
    }

    async create(clientData: Partial<Client>): Promise<Client> {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .insert([clientData])
                .select()
                .single();

            if (error) {
                this.logger.error('Error creating client:', error);
                throw new Error(`Failed to create client: ${error.message}`);
            }

            this.logger.log(`Client created with ID: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error in create method:', error);
            throw error;
        }
    }

    async findAll(): Promise<Client[]> {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                this.logger.error('Error fetching clients:', error);
                throw new Error(`Failed to fetch clients: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            this.logger.error('Error in findAll method:', error);
            throw error;
        }
    }

    async findOne(id: string): Promise<Client> {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error(`Client with ID ${id} not found`);
                }
                throw new Error(`Failed to fetch client: ${error.message}`);
            }

            return data;
        } catch (error) {
            this.logger.error('Error in findOne method:', error);
            throw error;
        }
    }

    async update(id: string, updateData: Partial<Client>): Promise<Client> {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error(`Client with ID ${id} not found`);
                }
                throw new Error(`Failed to update client: ${error.message}`);
            }

            this.logger.log(`Client updated with ID: ${id}`);
            return data;
        } catch (error) {
            this.logger.error('Error in update method:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Failed to delete client: ${error.message}`);
            }

            this.logger.log(`Client deleted with ID: ${id}`);
        } catch (error) {
            this.logger.error('Error in remove method:', error);
            throw error;
        }
    }

    async searchClients(searchQuery: SearchQueryDto): Promise<Client[]> {
        try {
            let query = this.supabase.from('clients').select('*');

            // Apply text search if provided
            if (searchQuery.searchTerm) {
                query = query.or(`
          first_name.ilike.%${searchQuery.searchTerm}%,
          last_name.ilike.%${searchQuery.searchTerm}%,
          business_name.ilike.%${searchQuery.searchTerm}%,
          email.ilike.%${searchQuery.searchTerm}%
        `);
            }

            // Apply location filters if provided
            if (searchQuery.state) {
                query = query.eq('address->state', searchQuery.state);
            }
            if (searchQuery.city) {
                query = query.eq('address->city', searchQuery.city);
            }
            if (searchQuery.zipCode) {
                query = query.eq('address->zip_code', searchQuery.zipCode);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Search failed: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            this.logger.error('Error in searchClients method:', error);
            throw error;
        }
    }
}