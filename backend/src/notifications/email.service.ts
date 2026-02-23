import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  async sendEmail(to: string, subject: string, text: string) {
    if (!process.env.SMTP_HOST) {
      // dev fallback: log instead of failing
      this.logger.warn(`SMTP not configured; would email ${to}: ${subject}\n${text}`);
      return { mocked: true };
    }

    return this.transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'no-reply@headword.local',
      to,
      subject,
      text,
    });
  }
}