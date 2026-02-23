'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { AdminOnly } from '@/components/RoleGuard';
import { useUser } from '@/contexts/UserContext';

interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Administrator' | 'Manager' | 'User';
    status: 'Active' | 'Inactive';
    lastLogin: string;
    createdAt: string;
}

interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalClients: number;
    systemUptime: string;
    lastBackup: string;
}

export default function ManagementPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 15,
        activeUsers: 12,
        totalProjects: 47,
        totalClients: 89,
        systemUptime: '99.9%',
        lastBackup: '2 hours ago'
    });
    const [loading, setLoading] = useState(false);

    // Mock user data - replace with API call
    useEffect(() => {
        const mockUsers: UserData[] = [
            {
                id: '1',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@headword.com',
                role: 'Administrator',
                status: 'Active',
                lastLogin: '2026-02-17T10:30:00Z',
                createdAt: '2025-01-01T00:00:00Z'
            },
            {
                id: '2',
                firstName: 'John',
                lastName: 'Manager',
                email: 'john.manager@headword.com',
                role: 'Manager',
                status: 'Active',
                lastLogin: '2026-02-17T09:15:00Z',
                createdAt: '2025-02-15T00:00:00Z'
            },
            {
                id: '3',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@headword.com',
                role: 'User',
                status: 'Active',
                lastLogin: '2026-02-16T16:45:00Z',
                createdAt: '2025-03-20T00:00:00Z'
            },
            {
                id: '4',
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@headword.com',
                role: 'User',
                status: 'Inactive',
                lastLogin: '2026-02-10T12:00:00Z',
                createdAt: '2025-05-10T00:00:00Z'
            }
        ];
        setUsers(mockUsers);
    }, []);

    const handleRoleChange = (userId: string, newRole: string) => {
        setUsers(prev => prev.map(user => 
            user.id === userId 
                ? { ...user, role: newRole as 'Administrator' | 'Manager' | 'User' }
                : user
        ));
    };

    const handleStatusToggle = (userId: string) => {
        setUsers(prev => prev.map(user => 
            user.id === userId 
                ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
                : user
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
        <div style={{
            background: 'white',
            borderRadius: 15,
            padding: '25px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <div style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)',
                marginBottom: '8px',
                fontFamily: 'Inter',
                fontWeight: '600'
            }}>
                {title}
            </div>
            <div style={{
                fontSize: '32px',
                fontWeight: '600',
                color: '#FF5900',
                marginBottom: '5px',
                fontFamily: 'Inter'
            }}>
                {value}
            </div>
            {subtitle && (
                <div style={{
                    fontSize: '12px',
                    color: 'rgba(0, 0, 0, 0.5)',
                    fontFamily: 'Inter'
                }}>
                    {subtitle}
                </div>
            )}
        </div>
    );

    return (
        <AdminOnly>
            <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
                <Sidebar activePage="management" />

                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'rgba(217, 217, 217, 0.15)', 
                    padding: '20px 20px 20px 30px', 
                    gap: '20px' 
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{
                            color: 'black',
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
                                color: 'rgba(0, 0, 0, 0.7)',
                                fontFamily: 'Inter'
                            }}>
                                Welcome, {user?.firstName} {user?.lastName}
                            </div>
                            <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} style={{
                                        width: 8,
                                        height: 8,
                                        background: '#666',
                                        borderRadius: '50%',
                                        cursor: 'pointer'
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <StatCard title="Total Users" value={stats.totalUsers.toString()} />
                        <StatCard title="Active Users" value={stats.activeUsers.toString()} />
                        <StatCard title="Total Projects" value={stats.totalProjects.toString()} />
                        <StatCard title="Total Clients" value={stats.totalClients.toString()} />
                        <StatCard title="System Uptime" value={stats.systemUptime} />
                        <StatCard title="Last Backup" value={stats.lastBackup} />
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
                                        margin: 0
                                    }}>
                                        User Management
                                    </h3>
                                    <button style={{
                                        padding: '10px 20px',
                                        background: '#FF5900',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontSize: '14px',
                                        fontFamily: 'Poppins',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}>
                                        + Add User
                                    </button>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(217, 217, 217, 0.3)' }}>
                                                <th style={{ padding: '15px', textAlign: 'left', fontFamily: 'Inter', fontWeight: '600' }}>Name</th>
                                                <th style={{ padding: '15px', textAlign: 'left', fontFamily: 'Inter', fontWeight: '600' }}>Email</th>
                                                <th style={{ padding: '15px', textAlign: 'left', fontFamily: 'Inter', fontWeight: '600' }}>Role</th>
                                                <th style={{ padding: '15px', textAlign: 'left', fontFamily: 'Inter', fontWeight: '600' }}>Status</th>
                                                <th style={{ padding: '15px', textAlign: 'left', fontFamily: 'Inter', fontWeight: '600' }}>Last Login</th>
                                                <th style={{ padding: '15px', textAlign: 'left', fontFamily: 'Inter', fontWeight: '600' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(userData => (
                                                <tr key={userData.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                    <td style={{ padding: '15px', fontFamily: 'Inter' }}>
                                                        {userData.firstName} {userData.lastName}
                                                    </td>
                                                    <td style={{ padding: '15px', fontFamily: 'Inter', color: 'rgba(0, 0, 0, 0.7)' }}>
                                                        {userData.email}
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <select
                                                            value={userData.role}
                                                            onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                                            style={{
                                                                padding: '5px 10px',
                                                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                                                borderRadius: 5,
                                                                fontFamily: 'Inter'
                                                            }}
                                                        >
                                                            <option value="Administrator">Administrator</option>
                                                            <option value="Manager">Manager</option>
                                                            <option value="User">User</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: 15,
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            background: userData.status === 'Active' ? '#E7F7E7' : '#FFE7E7',
                                                            color: userData.status === 'Active' ? '#00AA00' : '#CC0000'
                                                        }}>
                                                            {userData.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px', fontFamily: 'Inter', fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)' }}>
                                                        {formatDate(userData.lastLogin)}
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleStatusToggle(userData.id)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: userData.status === 'Active' ? '#FFE7E7' : '#E7F7E7',
                                                                    color: userData.status === 'Active' ? '#CC0000' : '#00AA00',
                                                                    border: 'none',
                                                                    borderRadius: 5,
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {userData.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button style={{
                                                                padding: '6px 12px',
                                                                background: '#F0F0F0',
                                                                color: 'black',
                                                                border: 'none',
                                                                borderRadius: 5,
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}>
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div>
                                <h3 style={{
                                    fontSize: '24px',
                                    fontFamily: 'Poppins',
                                    fontWeight: '600',
                                    marginBottom: '25px'
                                }}>
                                    System Settings
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>Backup Schedule</div>
                                            <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)' }}>Automated daily backups at 2:00 AM</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px',
                                            background: '#FF5900',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 5,
                                            cursor: 'pointer'
                                        }}>
                                            Configure
                                        </button>
                                    </div>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>System Maintenance</div>
                                            <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)' }}>Last maintenance: February 15, 2026</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px',
                                            background: '#FF5900',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 5,
                                            cursor: 'pointer'
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
                                    marginBottom: '25px'
                                }}>
                                    Security Settings
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: 10
                                    }}>
                                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '15px' }}>Password Policy</div>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(0, 0, 0, 0.7)' }}>
                                            <li>Minimum 8 characters</li>
                                            <li>Must contain uppercase and lowercase letters</li>
                                            <li>Must contain at least one number</li>
                                            <li>Password expires every 90 days</li>
                                        </ul>
                                    </div>
                                    <div style={{
                                        padding: '20px',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>Two-Factor Authentication</div>
                                            <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)' }}>Enforce 2FA for all admin users</div>
                                        </div>
                                        <button style={{
                                            padding: '8px 16px',
                                            background: '#00AA00',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 5,
                                            cursor: 'pointer'
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
                                    marginBottom: '25px'
                                }}>
                                    Activity Logs
                                </h3>
                                <div style={{
                                    padding: '20px',
                                    background: 'rgba(217, 217, 217, 0.1)',
                                    borderRadius: 10,
                                    textAlign: 'center',
                                    color: 'rgba(0, 0, 0, 0.6)'
                                }}>
                                    <div style={{ fontSize: '18px', marginBottom: '10px' }}>📊</div>
                                    <div>Activity logs will be displayed here</div>
                                    <div style={{ fontSize: '14px', marginTop: '5px' }}>Coming soon...</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminOnly>
    );
}