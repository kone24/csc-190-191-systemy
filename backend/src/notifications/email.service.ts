import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly supabase: SupabaseClient;

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
    }

    this.supabase = createClient(url, key);
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      return await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send email',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async getRecipientEmailForUser(userId: string): Promise<string | null> {
    this.logger.log(`Looking up recipient email for userId=${userId}`);

    const { data, error } = await this.supabase
      .from('users')
      .select('email')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to fetch email for user ${userId}: ${error.message}`);
      return null;
    }

    if (!data?.email) {
      this.logger.warn(`No email found for user ${userId}`);
      return null;
    }

    return data.email;
  }
}