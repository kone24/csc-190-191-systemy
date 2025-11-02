"use client";

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          {/* Actions */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="flex gap-4">
              <Link
                href="/dashboard/add-client"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                + Add Client
              </Link>
            </div>
          </div>

          {/* Future: Client List will go here */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Clients</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Client list will be displayed here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}