import { InvoiceOverdueProcessor } from './invoice-overdue.processor';
import { InvoicesSupabaseService } from './invoices.supabase.service';
import { EmailService } from '../notifications/email.service';
import { UsersService } from '../users/users.service';

describe('InvoiceOverdueProcessor', () => {
    let processor: InvoiceOverdueProcessor;
    let invoices: jest.Mocked<InvoicesSupabaseService>;
    let email: jest.Mocked<EmailService>;
    let usersService: jest.Mocked<UsersService>;

    const mockInvoice = {
        invoice_id: 'inv-001',
        invoice_number: 'INV-1001',
        status: 'unpaid',
        amount: 500,
        due_date: '2026-01-01',
        issued_by: 'user-1',
        clients: { id: 'c1', first_name: 'Jane', last_name: 'Doe' },
        metadata: {},
    };

    const mockUser = {
        user_id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
    };

    beforeEach(() => {
        invoices = {
            findUnpaidPastDue: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
        } as unknown as jest.Mocked<InvoicesSupabaseService>;

        email = {
            sendEmail: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<EmailService>;

        usersService = {
            findById: jest.fn(),
        } as unknown as jest.Mocked<UsersService>;

        processor = new InvoiceOverdueProcessor(invoices, email, usersService);
    });

    // =========================================================================
    // No past-due invoices
    // =========================================================================

    it('does nothing when no past-due invoices', async () => {
        invoices.findUnpaidPastDue.mockResolvedValue([]);
        await processor.handleOverdueInvoices();
        expect(invoices.update).not.toHaveBeenCalled();
        expect(email.sendEmail).not.toHaveBeenCalled();
    });

    // =========================================================================
    // Status flip
    // =========================================================================

    it('updates invoice status to overdue', async () => {
        invoices.findUnpaidPastDue.mockResolvedValue([mockInvoice as any]);
        usersService.findById.mockResolvedValue(mockUser as any);
        await processor.handleOverdueInvoices();
        expect(invoices.update).toHaveBeenCalledWith('inv-001', { status: 'overdue' });
    });

    // =========================================================================
    // Email recipients
    // =========================================================================

    it('sends email to issued_by when no metadata.owners', async () => {
        invoices.findUnpaidPastDue.mockResolvedValue([mockInvoice as any]);
        usersService.findById.mockResolvedValue(mockUser as any);
        await processor.handleOverdueInvoices();
        expect(usersService.findById).toHaveBeenCalledWith('user-1');
        expect(email.sendEmail).toHaveBeenCalledWith(
            'jane@example.com',
            expect.stringContaining('INV-1001'),
            expect.any(String),
        );
    });

    it('sends email to all metadata.owners when present', async () => {
        const inv = {
            ...mockInvoice,
            issued_by: null,
            metadata: { owners: ['owner-1', 'owner-2'] },
        };
        usersService.findById
            .mockResolvedValueOnce({ user_id: 'owner-1', email: 'o1@example.com' } as any)
            .mockResolvedValueOnce({ user_id: 'owner-2', email: 'o2@example.com' } as any);
        invoices.findUnpaidPastDue.mockResolvedValue([inv as any]);

        await processor.handleOverdueInvoices();

        expect(email.sendEmail).toHaveBeenCalledTimes(2);
        expect(email.sendEmail).toHaveBeenCalledWith('o1@example.com', expect.any(String), expect.any(String));
        expect(email.sendEmail).toHaveBeenCalledWith('o2@example.com', expect.any(String), expect.any(String));
    });

    it('skips email when user has no email address', async () => {
        invoices.findUnpaidPastDue.mockResolvedValue([mockInvoice as any]);
        usersService.findById.mockResolvedValue({ user_id: 'user-1', email: null } as any);
        await processor.handleOverdueInvoices();
        expect(email.sendEmail).not.toHaveBeenCalled();
    });

    it('skips email when user not found', async () => {
        invoices.findUnpaidPastDue.mockResolvedValue([mockInvoice as any]);
        usersService.findById.mockResolvedValue(null as any);
        await processor.handleOverdueInvoices();
        expect(email.sendEmail).not.toHaveBeenCalled();
    });

    // =========================================================================
    // Error resilience
    // =========================================================================

    it('continues processing remaining invoices when one fails', async () => {
        const inv2 = { ...mockInvoice, invoice_id: 'inv-002', invoice_number: 'INV-1002' };
        invoices.findUnpaidPastDue.mockResolvedValue([mockInvoice as any, inv2 as any]);
        invoices.update
            .mockRejectedValueOnce(new Error('update failed'))
            .mockResolvedValueOnce({} as any);
        usersService.findById.mockResolvedValue(mockUser as any);

        await expect(processor.handleOverdueInvoices()).resolves.not.toThrow();
        // Second invoice should still be processed
        expect(invoices.update).toHaveBeenCalledTimes(2);
    });
});
