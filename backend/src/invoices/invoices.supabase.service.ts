import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Invoice } from './entities/invoice.entity';

const SELECT_WITH_JOINS =
    '*, clients(id, first_name, last_name), users!invoice_issued_by_fkey(user_id, name), project(project_id, name)';

@Injectable()
export class InvoicesSupabaseService {
    private readonly logger = new Logger(InvoicesSupabaseService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized for invoices');
    }

    private async nextInvoiceNumber(): Promise<string> {
        const { data } = await this.supabase
            .from('invoice')
            .select('invoice_number')
            .like('invoice_number', 'INV-%')
            .order('created_at', { ascending: false })
            .limit(100);

        let max = 1000;
        for (const row of data || []) {
            const num = parseInt(row.invoice_number.replace('INV-', ''), 10);
            if (!isNaN(num) && num >= max) max = num + 1;
        }
        return `INV-${max}`;
    }

    async findAll(): Promise<Invoice[]> {
        const { data, error } = await this.supabase
            .from('invoice')
            .select(SELECT_WITH_JOINS)
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error('Error fetching invoices:', error);
            throw new Error(`Failed to fetch invoices: ${error.message}`);
        }

        return data || [];
    }

    async findOne(invoiceId: string): Promise<Invoice> {
        const { data, error } = await this.supabase
            .from('invoice')
            .select(SELECT_WITH_JOINS)
            .eq('invoice_id', invoiceId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error(`Invoice with ID ${invoiceId} not found`);
            }
            throw new Error(`Failed to fetch invoice: ${error.message}`);
        }

        return data;
    }

    async create(invoiceData: Partial<Invoice>): Promise<Invoice> {
        if (!invoiceData.invoice_number) {
            invoiceData.invoice_number = await this.nextInvoiceNumber();
        }

        const { data, error } = await this.supabase
            .from('invoice')
            .insert([invoiceData])
            .select(SELECT_WITH_JOINS)
            .single();

        if (error) {
            this.logger.error('Error creating invoice:', error);
            throw new Error(`Failed to create invoice: ${error.message}`);
        }

        return data;
    }

    async update(invoiceId: string, updateData: Partial<Invoice>): Promise<Invoice> {
        const { data, error } = await this.supabase
            .from('invoice')
            .update(updateData)
            .eq('invoice_id', invoiceId)
            .select(SELECT_WITH_JOINS)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error(`Invoice with ID ${invoiceId} not found`);
            }
            throw new Error(`Failed to update invoice: ${error.message}`);
        }

        this.logger.log(`Invoice updated: ${invoiceId}`);
        return data;
    }

    async remove(invoiceId: string): Promise<void> {
        const { error } = await this.supabase
            .from('invoice')
            .delete()
            .eq('invoice_id', invoiceId);

        if (error) {
            throw new Error(`Failed to delete invoice: ${error.message}`);
        }

        this.logger.log(`Invoice deleted: ${invoiceId}`);
    }

    async search(term: string): Promise<Invoice[]> {
        const { data, error } = await this.supabase
            .from('invoice')
            .select(SELECT_WITH_JOINS)
            .or(`invoice_number.ilike.%${term}%`)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Search failed: ${error.message}`);
        }

        return data || [];
    }

    async findUnpaidPastDue(): Promise<Invoice[]> {
        const { data, error } = await this.supabase
            .from('invoice')
            .select(SELECT_WITH_JOINS)
            .eq('status', 'unpaid')
            .lt('due_date', new Date().toISOString());

        if (error) {
            this.logger.error('Error fetching unpaid past-due invoices:', error);
            throw new Error(`Failed to fetch overdue invoices: ${error.message}`);
        }

        return data || [];
    }
}
