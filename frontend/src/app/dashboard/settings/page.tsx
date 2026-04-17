'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const COMMON_TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
];

interface NotificationPrefs {
    followUpEnabled: boolean;
    channels: { email: boolean; dashboard: boolean };
}

export default function SettingsPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'notifications' | 'general' | 'integrations'>('notifications');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Notification preferences
    const [prefs, setPrefs] = useState<NotificationPrefs>({
        followUpEnabled: true,
        channels: { email: true, dashboard: true },
    });

    // Timezone
    const [timezone, setTimezone] = useState('America/Los_Angeles');

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        Promise.all([
            fetch(`${BACKEND_URL}/notifications/preferences/${user.id}`, { credentials: 'include' })
                .then(r => r.json())
                .then(d => { if (d.ok) setPrefs(d.preferences); })
                .catch(() => { }),
            fetch(`${BACKEND_URL}/users/${user.id}/timezone`, { credentials: 'include' })
                .then(r => r.json())
                .then(d => { if (d.ok) setTimezone(d.timezone); })
                .catch(() => { }),
        ]).finally(() => setLoading(false));
    }, [user]);

    const showSaved = (msg: string) => {
        setSaveMsg(msg);
        setTimeout(() => setSaveMsg(null), 2500);
    };

    const saveNotificationPrefs = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const res = await fetch(`${BACKEND_URL}/notifications/preferences/${user.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prefs),
            });
            if (res.ok) showSaved('Notification preferences saved');
        } catch {
            showSaved('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const saveTimezone = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const res = await fetch(`${BACKEND_URL}/users/${user.id}/timezone`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timezone }),
            });
            if (res.ok) showSaved('Timezone saved');
        } catch {
            showSaved('Failed to save timezone');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading...</div>
            </div>
        );
    }

    const tabStyle = (tab: string) => ({
        padding: '10px 24px',
        fontSize: 15,
        fontFamily: 'Poppins',
        fontWeight: activeTab === tab ? '600' : '400',
        color: activeTab === tab ? '#FF5900' : 'rgba(0,0,0,0.6)',
        background: 'none',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid #FF5900' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    });

    const cardStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: 16,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        padding: '24px',
        marginBottom: '20px',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 15,
        fontFamily: 'Poppins',
        fontWeight: '500',
        color: 'black',
        marginBottom: 4,
    };

    const descStyle: React.CSSProperties = {
        fontSize: 13,
        fontFamily: 'Poppins',
        color: 'rgba(0,0,0,0.5)',
        marginBottom: 0,
    };

    const toggleRow = (
        label: string,
        description: string,
        checked: boolean,
        onChange: (v: boolean) => void,
    ) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div>
                <div style={labelStyle}>{label}</div>
                <div style={descStyle}>{description}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 26, flexShrink: 0 }}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                    position: 'absolute', cursor: 'pointer', inset: 0,
                    backgroundColor: checked ? '#FF5900' : '#ccc',
                    borderRadius: 26, transition: 'background 0.3s',
                }} />
                <span style={{
                    position: 'absolute', left: checked ? 24 : 3, top: 3,
                    width: 20, height: 20, background: 'white', borderRadius: '50%',
                    transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
            </label>
        </div>
    );

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            <Sidebar activePage="settings" />

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: '20px',
            }}>
                {/* Header */}
                <div style={{ marginBottom: 10 }}>
                    <div style={{ color: 'black', fontSize: 32, fontFamily: 'Poppins', fontWeight: '600' }}>
                        Settings
                    </div>
                </div>

                {/* Save message */}
                {saveMsg && (
                    <div style={{
                        padding: '10px 20px', borderRadius: 10,
                        background: saveMsg.includes('Failed') ? '#fee' : '#e6f9ee',
                        color: saveMsg.includes('Failed') ? '#c00' : '#1a7a3a',
                        fontFamily: 'Poppins', fontSize: 14, fontWeight: '500',
                        maxWidth: 800,
                    }}>
                        {saveMsg}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(0,0,0,0.1)', maxWidth: 800 }}>
                    <button style={tabStyle('notifications')} onClick={() => setActiveTab('notifications')}>Notifications</button>
                    <button style={tabStyle('general')} onClick={() => setActiveTab('general')}>General</button>
                    <button style={tabStyle('integrations')} onClick={() => setActiveTab('integrations')}>Integrations</button>
                </div>

                {loading ? (
                    <div style={{ fontFamily: 'Poppins', color: 'rgba(0,0,0,0.5)', padding: 40 }}>Loading settings...</div>
                ) : (
                    <div style={{ maxWidth: 800 }}>

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 16, color: '#111111' }}>
                                        Notification Preferences
                                    </div>
                                    {toggleRow(
                                        'Follow-up Reminders',
                                        'Receive reminders to follow up with clients after interactions',
                                        prefs.followUpEnabled,
                                        (v) => setPrefs(p => ({ ...p, followUpEnabled: v })),
                                    )}
                                    {toggleRow(
                                        'Email Notifications',
                                        'Receive follow-up reminders via email',
                                        prefs.channels.email,
                                        (v) => setPrefs(p => ({ ...p, channels: { ...p.channels, email: v } })),
                                    )}
                                    {toggleRow(
                                        'Dashboard Notifications',
                                        'Show reminder banners on the dashboard',
                                        prefs.channels.dashboard,
                                        (v) => setPrefs(p => ({ ...p, channels: { ...p.channels, dashboard: v } })),
                                    )}
                                </div>
                                <button
                                    onClick={saveNotificationPrefs}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 28px', background: '#FF5900', color: 'white',
                                        border: 'none', borderRadius: 10, fontSize: 15, fontFamily: 'Poppins',
                                        fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.6 : 1, transition: 'opacity 0.2s',
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </>
                        )}

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 16, color: '#111111' }}>
                                        Timezone
                                    </div>
                                    <div style={descStyle}>
                                        Used for scheduling reminders and displaying dates.
                                    </div>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        style={{
                                            marginTop: 12, padding: '10px 14px', borderRadius: 10,
                                            border: '1px solid rgba(0,0,0,0.15)', fontSize: 15,
                                            fontFamily: 'Poppins', width: '100%', maxWidth: 350,
                                            background: 'white', cursor: 'pointer',
                                        }}
                                    >
                                        {COMMON_TIMEZONES.map(tz => (
                                            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={saveTimezone}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 28px', background: '#FF5900', color: 'white',
                                        border: 'none', borderRadius: 10, fontSize: 15, fontFamily: 'Poppins',
                                        fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.6 : 1, transition: 'opacity 0.2s',
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Timezone'}
                                </button>
                            </>
                        )}

                        {/* Integrations Tab */}
                        {activeTab === 'integrations' && (
                            <div style={cardStyle}>
                                <div style={{ fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 16, color: '#111111' }}>
                                    Connected Services
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18,
                                    }}>
                                        G
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={labelStyle}>Google Workspace</div>
                                        <div style={descStyle}>Calendar & Contacts sync via OAuth</div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px', borderRadius: 20,
                                        background: user.email ? '#e6f9ee' : '#fee',
                                        color: user.email ? '#1a7a3a' : '#c00',
                                        fontSize: 13, fontFamily: 'Poppins', fontWeight: '500',
                                    }}>
                                        {user.email ? 'Connected' : 'Not Connected'}
                                    </div>
                                </div>
                                {user.email && (
                                    <div style={{ ...descStyle, marginTop: 10 }}>
                                        Signed in as <strong>{user.email}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
