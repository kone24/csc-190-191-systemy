'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';
import { AdminOnly } from '@/components/RoleGuard';

type SettingsTab = 'notifications' | 'display' | 'company' | 'security' | 'integrations';

export default function SettingsPage() {
    const { user, isAdmin } = useUser();
    const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');

    // Notification preferences state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [reminderEmails, setReminderEmails] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);

    // Display preferences state
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('America/Los_Angeles');

    // Company settings state (admin only)
    const [companyName, setCompanyName] = useState('Headword Inc.');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');

    // Integration settings state
    const [googleCalSync, setGoogleCalSync] = useState(false);
    const [emailSync, setEmailSync] = useState(false);

    const tabs: { id: SettingsTab; label: string; icon: string; adminOnly?: boolean }[] = [
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'display', label: 'Display', icon: '🎨' },
        { id: 'company', label: 'Company', icon: '🏢', adminOnly: true },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'integrations', label: 'Integrations', icon: '🔗' },
    ];

    const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

    const cardStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: 20,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        padding: '30px',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 14,
        fontFamily: 'Poppins',
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.7)',
        marginBottom: 8,
        display: 'block',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 15px',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        fontSize: 16,
        fontFamily: 'Poppins',
        background: 'white',
        color: 'black',
    };

    const toggleRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    };

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: 48,
                height: 26,
                borderRadius: 13,
                background: checked ? '#FF5900' : '#ccc',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
                flexShrink: 0,
            }}
        >
            <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: 2,
                left: checked ? 24 : 2,
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
        </div>
    );

    const SectionTitle = ({ title }: { title: string }) => (
        <h3 style={{
            fontSize: 22,
            fontFamily: 'Poppins',
            fontWeight: '600',
            color: '#111',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            marginTop: 0,
        }}>
            {title}
        </h3>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{
                        color: '#111',
                        fontSize: 32,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                    }}>
                        Settings
                    </div>
                    <div style={{ fontSize: 14, color: '#333', fontFamily: 'Poppins', fontWeight: '500' }}>
                        {user?.name}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                background: activeTab === tab.id ? '#FF5900' : 'white',
                                color: activeTab === tab.id ? 'white' : 'black',
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: 10,
                                fontSize: 16,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={cardStyle}>

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div>
                            <SectionTitle title="Notification Preferences" />
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: '500', fontFamily: 'Poppins', color: '#111' }}>Email Notifications</div>
                                    <div style={{ fontSize: 13, color: '#666', fontFamily: 'Poppins' }}>Receive email notifications for important updates</div>
                                </div>
                                <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
                            </div>
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: '500', fontFamily: 'Poppins', color: '#111' }}>Push Notifications</div>
                                    <div style={{ fontSize: 13, color: '#666', fontFamily: 'Poppins' }}>Receive browser push notifications</div>
                                </div>
                                <Toggle checked={pushNotifications} onChange={setPushNotifications} />
                            </div>
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: '500', fontFamily: 'Poppins', color: '#111' }}>Reminder Emails</div>
                                    <div style={{ fontSize: 13, color: '#666', fontFamily: 'Poppins' }}>Get reminders for upcoming tasks and follow-ups</div>
                                </div>
                                <Toggle checked={reminderEmails} onChange={setReminderEmails} />
                            </div>
                            <div style={{ ...toggleRowStyle, borderBottom: 'none' }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: '500', fontFamily: 'Poppins', color: '#111' }}>Weekly Digest</div>
                                    <div style={{ fontSize: 13, color: '#666', fontFamily: 'Poppins' }}>Receive a weekly summary of activity</div>
                                </div>
                                <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
                            </div>
                        </div>
                    )}

                    {/* Display Tab */}
                    {activeTab === 'display' && (
                        <div>
                            <SectionTitle title="Display Preferences" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div>
                                    <label style={labelStyle}>Theme</label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {(['light', 'dark'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTheme(t)}
                                                style={{
                                                    padding: '12px 24px',
                                                    border: theme === t ? '2px solid #FF5900' : '1px solid rgba(0,0,0,0.2)',
                                                    borderRadius: 10,
                                                    background: t === 'dark' ? '#1a1a1a' : 'white',
                                                    color: t === 'dark' ? 'white' : 'black',
                                                    fontSize: 15,
                                                    fontFamily: 'Poppins',
                                                    fontWeight: theme === t ? '600' : '400',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
                                        <option value="en">English</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Timezone</label>
                                    <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle}>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Company Tab (Admin Only) */}
                    {activeTab === 'company' && (
                        <AdminOnly>
                            <div>
                                <SectionTitle title="Company Settings" />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                                    <div>
                                        <label style={labelStyle}>Company Name</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Company Email</label>
                                        <input
                                            type="email"
                                            value={companyEmail}
                                            onChange={e => setCompanyEmail(e.target.value)}
                                            placeholder="contact@company.com"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Company Phone</label>
                                        <input
                                            type="tel"
                                            value={companyPhone}
                                            onChange={e => setCompanyPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Website</label>
                                        <input
                                            type="url"
                                            value={companyWebsite}
                                            onChange={e => setCompanyWebsite(e.target.value)}
                                            placeholder="https://company.com"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button style={{
                                        padding: '12px 24px',
                                        background: '#FF5900',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontSize: 16,
                                        fontFamily: 'Poppins',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                    }}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </AdminOnly>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div>
                            <SectionTitle title="Security Settings" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{
                                    padding: 20,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    borderRadius: 10,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#111', fontFamily: 'Poppins' }}>Change Password</div>
                                        <div style={{ fontSize: 14, color: '#555', fontFamily: 'Poppins' }}>Update your account password</div>
                                    </div>
                                    <button style={{
                                        padding: '8px 16px',
                                        background: '#FF5900',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 5,
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins',
                                        fontSize: 14,
                                    }}>
                                        Update
                                    </button>
                                </div>
                                <div style={{
                                    padding: 20,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    borderRadius: 10,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#111', fontFamily: 'Poppins' }}>Two-Factor Authentication</div>
                                        <div style={{ fontSize: 14, color: '#555', fontFamily: 'Poppins' }}>Add an extra layer of security to your account</div>
                                    </div>
                                    <button style={{
                                        padding: '8px 16px',
                                        background: '#FF5900',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 5,
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins',
                                        fontSize: 14,
                                    }}>
                                        Enable
                                    </button>
                                </div>
                                <div style={{
                                    padding: 20,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    borderRadius: 10,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#111', fontFamily: 'Poppins' }}>Active Sessions</div>
                                        <div style={{ fontSize: 14, color: '#555', fontFamily: 'Poppins' }}>Manage your active login sessions</div>
                                    </div>
                                    <button style={{
                                        padding: '8px 16px',
                                        background: 'white',
                                        color: '#FF5900',
                                        border: '2px solid #FF5900',
                                        borderRadius: 5,
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins',
                                        fontSize: 14,
                                    }}>
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === 'integrations' && (
                        <div>
                            <SectionTitle title="Integration Settings" />
                            <div style={toggleRowStyle}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: '500', fontFamily: 'Poppins', color: '#111' }}>Google Calendar Sync</div>
                                    <div style={{ fontSize: 13, color: '#666', fontFamily: 'Poppins' }}>Sync your CRM events with Google Calendar</div>
                                </div>
                                <Toggle checked={googleCalSync} onChange={setGoogleCalSync} />
                            </div>
                            <div style={{ ...toggleRowStyle, borderBottom: 'none' }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: '500', fontFamily: 'Poppins', color: '#111' }}>Email Sync</div>
                                    <div style={{ fontSize: 13, color: '#666', fontFamily: 'Poppins' }}>Automatically log emails to client records</div>
                                </div>
                                <Toggle checked={emailSync} onChange={setEmailSync} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
