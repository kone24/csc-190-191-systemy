'use client';

import { useEffect, useState } from 'react';

type Reminder = {
  id: string;
  client_id?: string | null;
  interaction_id?: string | null;
  title: string;
  description?: string | null;
  remind_at: string;
  timezone: string;
  status: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ReminderBanner() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDueReminders() {
      try {
        const response = await fetch(`${API_URL}/reminders/dashboard/due`, {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch due reminders: ${response.status}`);
        }

        const data = await response.json();
        console.log('dashboard due reminders response:', data);

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];

        setReminders(items);
      } catch (error) {
        console.error('Error fetching due reminders:', error);
        setReminders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDueReminders();
  }, []);

  async function markComplete(id: string) {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark reminder complete');
      }

      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    } catch (error) {
      console.error('Error marking reminder complete:', error);
    }
  }

  if (loading || reminders.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <h2 className="mb-3 text-lg font-semibold">
        Due reminders ({reminders.length})
      </h2>

      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="rounded-lg border bg-white p-3 shadow-sm">
            <div className="font-medium">{reminder.title}</div>

            {reminder.description ? (
              <div className="mt-1 text-sm text-gray-600">
                {reminder.description}
              </div>
            ) : null}

            <div className="mt-2 text-xs text-gray-500">
              Due: {new Date(reminder.remind_at).toLocaleString('en-US', { timeZone: 'UTC' })}
            </div>

            <button
              onClick={() => markComplete(reminder.id)}
              className="mt-3 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Mark complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}