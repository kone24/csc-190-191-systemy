import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InvoicesSupabaseService } from './invoices.supabase.service';
import { EmailService } from '../notifications/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class InvoiceOverdueProcessor {
    private readonly logger = new Logger(InvoiceOverdueProcessor.name);

    constructor(
        private readonly invoices: InvoicesSupabaseService,
        private readonly email: EmailService,
        private readonly usersService: UsersService,
    ) {}

    @Cron('*/60 * * * * *')
    async handleOverdueInvoices() {
        const pastDue = await this.invoices.findUnpaidPastDue();
        if (pastDue.length === 0) return;
        this.logger.log(`InvoiceOverdueProcessor: found ${pastDue.length} past-due invoice(s)`);

        for (const invoice of pastDue) {
            try {
                // Flip status to overdue
                await this.invoices.update(invoice.invoice_id, { status: 'overdue' });

                // Determine all owners to notify (metadata.owners array, fallback to issued_by)
                const ownerIds: string[] =
                    Array.isArray((invoice.metadata as Record<string, unknown>)?.owners)
                        ? ((invoice.metadata as Record<string, unknown>).owners as string[])
                        : invoice.issued_by ? [invoice.issued_by] : [];

                const clientName = invoice.clients
                    ? `${invoice.clients.first_name} ${invoice.clients.last_name}`.trim()
                    : 'Unknown Client';
                const subject = `Invoice ${invoice.invoice_number} is overdue`;
                const body = [
                    `Invoice ${invoice.invoice_number} for ${clientName} is now overdue.`,
                    `Amount: $${Number(invoice.amount).toFixed(2)}`,
                    `Due date: ${invoice.due_date}`,
                    '',
                    'Please follow up with the client to arrange payment.',
                ].join('\n');

                for (const ownerId of ownerIds) {
                    const user = await this.usersService.findById(ownerId);
                    if (user?.email) {
                        await this.email.sendEmail(user.email, subject, body);
                        this.logger.log(`Overdue email sent for invoice ${invoice.invoice_number} to ${user.email}`);
                    }
                }
            } catch (err) {
                this.logger.error(`Failed to process overdue invoice ${invoice.invoice_id}`, err as any);
            }
        }
    }
}
