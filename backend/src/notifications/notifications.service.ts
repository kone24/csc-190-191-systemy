import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type DashboardNotification = {
  id: string;
  userId: string;
  clientId: string;
  interactionId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  private notifications: DashboardNotification[] = [];

  createDashboardAlert(input: Omit<DashboardNotification, 'id' | 'isRead' | 'createdAt'>) {
    const notif: DashboardNotification = {
      id: randomUUID(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.notifications.push(notif);
    return notif;
  }

  listForUser(userId: string) {
    return this.notifications.filter(n => n.userId === userId);
  }
}