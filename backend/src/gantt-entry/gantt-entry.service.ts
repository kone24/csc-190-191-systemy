import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateGanttEntryDto, UpdateGanttEntryDto } from './dto/gantt-entry.dto';

export interface GanttEntryRecord {
    gantt_entry_id: string;
    client_id: string;
    project_id: string;
    title: string;
    assignee: string | null;
    color: string;
    start_date: string;
    end_date: string;
    lane: number | null;
}

@Injectable()
export class GanttEntryService {
    private readonly logger = new Logger(GanttEntryService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized for GanttEntryService');
    }

    async findAll(): Promise<GanttEntryRecord[]> {
        try {
            const { data, error } = await this.supabase
                .from('gantt_entry')
                .select('gantt_entry_id, client_id, project_id, title, assignee, color, start_date, end_date, lane')
                .order('start_date', { ascending: true });

            if (error) {
                this.logger.error('Error fetching gantt entries:', error);
                throw new Error(`Failed to fetch gantt entries: ${error.message}`);
            }

            return data ?? [];
        } catch (error) {
            this.logger.error('Error in findAll method:', error);
            throw error;
        }
    }

    async create(dto: CreateGanttEntryDto): Promise<GanttEntryRecord> {
        try {
            const { data, error } = await this.supabase
                .from('gantt_entry')
                .insert({
                    client_id: dto.client_id,
                    project_id: dto.project_id,
                    title: dto.title,
                    assignee: dto.assignee ?? null,
                    color: dto.color,
                    start_date: dto.start_date,
                    end_date: dto.end_date,
                    lane: dto.lane ?? null,
                })
                .select('gantt_entry_id, client_id, project_id, title, assignee, color, start_date, end_date, lane')
                .single();

            if (error) {
                this.logger.error('Error creating gantt entry:', error);
                throw new Error(`Failed to create gantt entry: ${error.message}`);
            }

            return data;
        } catch (error) {
            this.logger.error('Error in create method:', error);
            throw error;
        }
    }

    async update(id: string, dto: UpdateGanttEntryDto): Promise<GanttEntryRecord> {
        try {
            const updateData: Record<string, unknown> = {};
            if (dto.client_id !== undefined) updateData.client_id = dto.client_id;
            if (dto.project_id !== undefined) updateData.project_id = dto.project_id;
            if (dto.title !== undefined) updateData.title = dto.title;
            if (dto.assignee !== undefined) updateData.assignee = dto.assignee;
            if (dto.color !== undefined) updateData.color = dto.color;
            if (dto.start_date !== undefined) updateData.start_date = dto.start_date;
            if (dto.end_date !== undefined) updateData.end_date = dto.end_date;
            if (dto.lane !== undefined) updateData.lane = dto.lane;

            const { data, error } = await this.supabase
                .from('gantt_entry')
                .update(updateData)
                .eq('gantt_entry_id', id)
                .select('gantt_entry_id, client_id, project_id, title, assignee, color, start_date, end_date, lane')
                .single();

            if (error) {
                this.logger.error('Error updating gantt entry:', error);
                throw new Error(`Failed to update gantt entry: ${error.message}`);
            }

            if (!data) {
                throw new NotFoundException(`Gantt entry ${id} not found`);
            }

            return data;
        } catch (error) {
            this.logger.error('Error in update method:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('gantt_entry')
                .delete()
                .eq('gantt_entry_id', id);

            if (error) {
                this.logger.error('Error deleting gantt entry:', error);
                throw new Error(`Failed to delete gantt entry: ${error.message}`);
            }
        } catch (error) {
            this.logger.error('Error in remove method:', error);
            throw error;
        }
    }
}
