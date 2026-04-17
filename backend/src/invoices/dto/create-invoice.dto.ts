import { IsString, IsOptional, IsNumber, IsObject, IsIn } from 'class-validator';

export class CreateInvoiceDto {
    @IsOptional()
    @IsString()
    invoice_number?: string;

    @IsString()
    id: string; // client ID (FK → clients)

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    project_id?: string;

    @IsOptional()
    @IsString()
    issued_by?: string;

    @IsOptional()
    @IsString()
    due_date?: string;

    @IsOptional()
    @IsString()
    payment_link?: string;

    @IsOptional()
    @IsIn(['unpaid', 'paid', 'overdue', 'cancelled'])
    status?: 'unpaid' | 'paid' | 'overdue' | 'cancelled';

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}
