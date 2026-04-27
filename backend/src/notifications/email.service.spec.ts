import { InternalServerErrorException } from '@nestjs/common';
import { EmailService } from './email.service';

// ---------------------------------------------------------------------------
// Mock nodemailer
// ---------------------------------------------------------------------------

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail,
    })),
}));

// ---------------------------------------------------------------------------
// Mock Supabase
// ---------------------------------------------------------------------------

let maybeSingleResult: any = { data: null, error: null };

const mockSupabaseChain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockImplementation(() => maybeSingleResult),
};

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => mockSupabaseChain),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EmailService', () => {
    let service: EmailService;

    beforeEach(() => {
        jest.clearAllMocks();
        maybeSingleResult = { data: null, error: null };
        process.env.SUPABASE_URL = 'https://fake.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-key';
        process.env.MAIL_FROM = 'noreply@example.com';
        service = new EmailService();
    });

    // =========================================================================
    // sendEmail()
    // =========================================================================

    describe('sendEmail()', () => {
        it('calls transporter.sendMail with correct args', async () => {
            mockSendMail.mockResolvedValue({ messageId: 'msg-1' });
            await service.sendEmail('to@example.com', 'Subject', 'Body text');
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'noreply@example.com',
                to: 'to@example.com',
                subject: 'Subject',
                text: 'Body text',
            });
        });

        it('returns the result from sendMail', async () => {
            const mailResult = { messageId: 'msg-42' };
            mockSendMail.mockResolvedValue(mailResult);
            const result = await service.sendEmail('a@b.com', 'S', 'T');
            expect(result).toEqual(mailResult);
        });

        it('throws InternalServerErrorException when sendMail fails', async () => {
            mockSendMail.mockRejectedValue(new Error('SMTP error'));
            await expect(service.sendEmail('a@b.com', 'S', 'T')).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    // =========================================================================
    // getRecipientEmailForUser()
    // =========================================================================

    describe('getRecipientEmailForUser()', () => {
        it('returns email when user found', async () => {
            maybeSingleResult = { data: { email: 'user@example.com' }, error: null };
            const result = await service.getRecipientEmailForUser('user-1');
            expect(result).toBe('user@example.com');
        });

        it('returns null when user has no email', async () => {
            maybeSingleResult = { data: { email: null }, error: null };
            const result = await service.getRecipientEmailForUser('user-1');
            expect(result).toBeNull();
        });

        it('returns null when user not found (data is null)', async () => {
            maybeSingleResult = { data: null, error: null };
            const result = await service.getRecipientEmailForUser('user-1');
            expect(result).toBeNull();
        });

        it('returns null on Supabase error', async () => {
            maybeSingleResult = { data: null, error: { message: 'query failed' } };
            const result = await service.getRecipientEmailForUser('user-1');
            expect(result).toBeNull();
        });
    });
});
