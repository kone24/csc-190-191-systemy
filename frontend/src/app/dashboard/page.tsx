"use client";

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 0' }}>
      <main style={{ margin: '0 auto', maxWidth: '1280px', padding: '0 16px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#000', fontFamily: 'Inter' }}>Dashboard</h1>
        </div>

        <div style={{ borderRadius: '8px', background: '#ffffff', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          {/* Actions */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#000', fontFamily: 'Inter' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link
                href="/dashboard/add-client"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: '#2563eb',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#ffffff',
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontFamily: 'Inter'
                }}
              >
                + Add Client
              </Link>
            </div>
          </div>

          {/* Future: Client List will go here */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', fontFamily: 'Inter' }}>Recent Clients</h2>
            <p style={{ color: '#6b7280', fontFamily: 'Inter' }}>
              Client list will be displayed here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}