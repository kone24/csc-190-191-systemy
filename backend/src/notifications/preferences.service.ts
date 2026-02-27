import { Injectable } from '@nestjs/common';

export type NotificationPreferences = {
  userId: string;
  followUpEnabled: boolean;
  channels: { email: boolean; dashboard: boolean };
};

@Injectable()
export class PreferencesService {
  // Replace with DB/JSON later
  private prefs = new Map<string, NotificationPreferences>();

  get(userId: string): NotificationPreferences {
    return (
      this.prefs.get(userId) ?? {
        userId,
        followUpEnabled: true,
        channels: { email: true, dashboard: true },
      }
    );
  }

  set(userId: string, update: Partial<NotificationPreferences>) {
    const current = this.get(userId);
    const merged: NotificationPreferences = {
      ...current,
      ...update,
      channels: { ...current.channels, ...(update.channels ?? {}) },
    };
    this.prefs.set(userId, merged);
    return merged;
  }
}