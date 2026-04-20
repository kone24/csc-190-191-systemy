'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { AdminOnly } from '@/components/RoleGuard';
import { useUser } from '@/contexts/UserContext';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
}

export default function ManagementPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch users');
                const data = await res.json();
                const mapped: UserData[] = (data.items ?? []).map((u: { user_id: string; name: string; email: string; role: string }) => ({
                    id: u.user_id,
                    name: u.name,
                    email: u.email,
                    role: (u.role as UserData['role']) ?? 'staff',
                }));
                setUsers(mapped);
            } catch (err) {
                setError('Failed to load users. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setRoleUpdating(userId);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/role`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error('Failed to update role');
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, role: newRole as UserData['role'] }
                    : u
            ));

        } catch (err) {
            setError('Failed to update user role. Please try again.');
            console.error(err);
        } finally {
            setRoleUpdating(null);
        }
    };

    const ROLE_OPTIONS: { value: UserData['role']; label: string }[] = [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'staff', label: 'Staff' },
    ];

    const roleColor = (role: string) => {
        if (role === 'admin') return { bg: '#FFF0E8', color: '#FF5900' };
        if (role === 'manager') return { bg: '#E8F0FF', color: '#2255CC' };
        return { bg: '#F0F0F0', color: '#333333' };
    };

    const roleLabel = (role: string) =>
        ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;

    return (
        <AdminOnly>
            <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
                <Sidebar activePage="management" />

                <div style={{
                    flex: 1,
                    minWidth: 0,
                    marginLeft: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(217, 217, 217, 0.15)',
                    padding: '20px 20px 20px 30px',
                    gap: '20px',
                    overflowX: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{
                            color: '#111111',
                            fontSize: 32,
                            fontFamily: 'Poppins',
                            fontWeight: '600',
                            wordWrap: 'break-word'
                        }}>
                            System Management
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#333333',
                                fontFamily: 'Poppins',
                                fontWeight: '500'
                            }}>
                                Welcome, {user?.firstName} {user?.lastName}
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '20px'
                    }}>
                        {[
                            { id: 'users', label: 'User Management', icon: '👥' },
                            { id: 'system', label: 'System Settings', icon: '⚙️' },
                            { id: 'security', label: 'Security', icon: '🔒' },
                            { id: 'logs', label: 'Activity Logs', icon: '📋' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 20px',
                                    background: activeTab === tab.id ? '#FF5900' : 'white',
                                    color: activeTab === tab.id ? 'white' : 'black',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 10,
                                    fontSize: '16px',
                                    fontFamily: 'Poppins',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{
                        background: 'white',
                        borderRadius: 20,
                        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                        padding: '30px',
                        flex: 1
                    }}>
                        {activeTab === 'users' && (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '25px'
                                }}>
                                    <h3 style={{
                                        fontSize: '24px',
                                        fontFamily: 'Poppins',
                                        fontWeight: '600',
                                        margin: 0,
                                        color: '#111111'
                                    }}>
                                        User Management
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '14px', fontFamily: 'Poppins', color: '#555555' }}>
                                            {users.length} user{users.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '12px 16px',
                                        background: '#FFF0F0',
                                        border: '1px solid #FFCCCC',
                                        borderRadius: 8,
                                        color: '#CC0000',
                                        fontFamily: 'Poppins',
                                        fontSize: '14px',
                                        marginBottom: '16px'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#555555', fontFamily: 'Poppins' }}>
                                        Loading users...
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'rgba(217, 217, 217, 0.4)' }}>
                                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Poppins', fontWeight: '600', color: '#111111', fontSize: '14px' }}>Name</th>
                                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Poppins', fontWeight: '600', color: '#111111', fontSize: '14px' }}>Email</th>
                                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Poppins', fontWeight: '600', color: '#111111', fontSize: '14px' }}>Current Role</th>
                                                    <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Poppins', fontWeight: '600', color: '#111111', fontSize: '14px' }}>Change Role</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(userData => {
                                                    const rc = roleColor(userData.role);
                                                    return (
                                                        <tr key={userData.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                                                            <td style={{ padding: '14px 16px', fontFamily: 'Poppins', fontWeight: '500', color: '#111111' }}>
                                                                {userData.name}
                                                            </td>
                                                            <td style={{ padding: '14px 16px', fontFamily: 'Poppins', color: '#444444', fontSize: '14px' }}>
                                                                {userData.email}
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <span style={{
                                                                    padding: '4px 12px',
                                                                    borderRadius: 20,
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    fontFamily: 'Poppins',
                                                                    background: rc.bg,
                                                                    color: rc.color
                                                                }}>
                                                                    {roleLabel(userData.role)}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '14px 16px' }}>
                                                                <select
                                                                    value={userData.role}
                                                                    disabled={roleUpdating === userData.id}
                                                                    onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                                                    style={{
                                                                        padding: '7px 12px',
                                                                        border: '1px solid #CCCCCC',
                                                                        borderRadius: 8,
                                                                        fontFamily: 'Poppins',
                                                                        fontSize: '14px',
                                                                        color: '#111111',
                                                                        background: roleUpdating === userData.id ? '#F5F5F5' : 'white',
                                                                        cursor: roleUpdating === userData.id ? 'not-allowed' : 'pointer',
                                                                        outline: 'none'
                                                                    }}
                                                                >
                                                                    {ROLE_OPTIONS.map(r => (
                                                                        <option key={r.value} value={r.value}>{r.label}</option>
                                                                    ))}
                                                                </select>
                                                                {roleUpdating === userData.id && (
                                                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#888888', fontFamily: 'Poppins' }}>Saving...</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div>
                                <h3 style={{
                                    fontSize: '24px',
                                    fontFamily: 'Poppins',
                                    fontWeight: '600',
                                    marginBottom: '25px',
                                    color: '#111111'
                                }}>
                                    System Settings
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.15)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#111111' }}>Backup Schedule</div>
                                            <div style={{ fontSize: '14px', color: '#555555' }}>Automated daily backups at 2:00 AM</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px',
                                            background: '#FF5900',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins'
                                        }}>
                                            Configure
                                        </button>
                                    </div>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.15)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#111111' }}>System Maintenance</div>
                                            <div style={{ fontSize: '14px', color: '#555555' }}>Last maintenance: February 15, 2026</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px',
                                            background: '#FF5900',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins'
                                        }}>
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h3 style={{
                                    fontSize: '24px',
                                    fontFamily: 'Poppins',
                                    fontWeight: '600',
                                    marginBottom: '25px',
                                    color: '#111111'
                                }}>
                                    Security Settings
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.15)',
                                        borderRadius: 10
                                    }}>
                                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#111111' }}>Password Policy</div>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#444444' }}>
                                            <li>Minimum 8 characters</li>
                                            <li>Must contain uppercase and lowercase letters</li>
                                            <li>Must contain at least one number</li>
                                            <li>Password expires every 90 days</li>
                                        </ul>
                                    </div>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.15)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#111111' }}>Two-Factor Authentication</div>
                                            <div style={{ fontSize: '14px', color: '#555555' }}>Enforce 2FA for all admin users</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px',
                                            background: '#00AA00',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins'
                                        }}>
                                            Enabled
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div>
                                <h3 style={{
                                    fontSize: '24px',
                                    fontFamily: 'Poppins',
                                    fontWeight: '600',
                                    marginBottom: '25px',
                                    color: '#111111'
                                }}>
                                    Activity Logs
                                </h3>
                                <div style={{
                                    padding: '40px 20px',
                                    background: 'rgba(217, 217, 217, 0.15)',
                                    borderRadius: 10,
                                    textAlign: 'center',
                                    color: '#444444'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                                    <div style={{ fontFamily: 'Poppins', fontWeight: '500', color: '#222222' }}>Activity logs will be displayed here</div>
                                    <div style={{ fontSize: '14px', marginTop: '5px', fontFamily: 'Poppins', color: '#666666' }}>Coming soon...</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminOnly>
    );
}