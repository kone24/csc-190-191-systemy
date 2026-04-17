export class Invoice {
    invoice_id: string;
    id: string; // FK → clients(id)
    project_id?: string;
    issued_by?: string;
    invoice_number: string;
    status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
    amount: number;
    due_date?: string;
    payment_link?: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
    // Joined relations
    clients?: { id: string; first_name: string; last_name: string };
    users?: { user_id: string; name: string };
    project?: { project_id: string; name: string };
}
