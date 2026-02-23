import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type ReminderStatus = 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'COMPLETED';

export type Reminder = {
  id: string;
  userId: string;
  clientId: string;
  interactionId: string;
  baseTimeISO: string;
  dueAt: string;
  status: ReminderStatus;
  sendEmail: boolean;
  sendDashboard: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  lastError?: string;
  followUpDays: number;
};

@Injectable()
export class RemindersService {
  // Replace with DB/JSON later
  private reminders: Reminder[] = [];

  createFollowUpReminder(args: {
    userId: string;
    clientId: string;
    interactionId: string;
    followUpDays: number; 
    baseTimeISO: string;  
    sendEmail: boolean;
    sendDashboard: boolean;
  }): Reminder {
    const base = new Date(args.baseTimeISO);
    const due = new Date(base.getTime() + args.followUpDays * 24 * 60 * 60 * 1000);

    const nowISO = new Date().toISOString();
    const reminder: Reminder = {
      id: randomUUID(),
      userId: args.userId,
      clientId: args.clientId,
      interactionId: args.interactionId,
      baseTimeISO: args.baseTimeISO,
      dueAt: due.toISOString(),
      status: 'SCHEDULED',
      sendEmail: args.sendEmail,
      sendDashboard: args.sendDashboard,
      createdAt: nowISO,
      updatedAt: nowISO,
      followUpDays: args.followUpDays,
    };

    this.reminders.push(reminder);
    return reminder;
  }

  listDue(now = new Date()): Reminder[] {
    return this.reminders.filter(r =>
      (r.status === 'SCHEDULED' || r.status === 'FAILED') &&
      new Date(r.dueAt).getTime() <= now.getTime()
    );
  }

  listAll() {
    return this.reminders;
  }

  markSending(id: string) {
    const r = this.mustGet(id);
    r.status = 'SENDING';
    r.updatedAt = new Date().toISOString();
    return r;
  }

  markSent(id: string) {
    const r = this.mustGet(id);
    r.status = 'SENT';
    r.updatedAt = new Date().toISOString();
    // If your AC literally means “completed once set”, you could set COMPLETED at creation time.
    // Practically: COMPLETED after delivery.
    r.status = 'COMPLETED';
    r.completedAt = new Date().toISOString();
    return r;
  }

  markFailed(id: string, err: unknown) {
    const r = this.mustGet(id);
    r.status = 'FAILED';
    r.lastError = err instanceof Error ? err.message : String(err);
    r.updatedAt = new Date().toISOString();
    return r;
  }

  private mustGet(id: string) {
    const found = this.reminders.find(r => r.id === id);
    if (!found) throw new Error(`Reminder not found: ${id}`);
    return found;
  }
}