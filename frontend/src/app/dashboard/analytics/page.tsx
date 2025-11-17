'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsData {
    totalUsers: number;
    activeUsers: number;
    pageViews: number;
    conversionRate: number;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({
        totalUsers: 0,
        activeUsers: 0,
        pageViews: 0,
        conversionRate: 0,
    });
    const [loading, setLoading] = useState(true);

    // Add this simple bar chart data
    const barChartData = [
        { month: 'Jan', revenue: 4200 },
        { month: 'Feb', revenue: 3100 },
        { month: 'Mar', revenue: 5200 },
        { month: 'Apr', revenue: 2800 },
        { month: 'May', revenue: 3900 }
    ];

    const lineChartData = [
        { month: 'Jan', users: 1200, sessions: 2400 },
        { month: 'Feb', users: 1900, sessions: 2800 },
        { month: 'Mar', users: 2100, sessions: 3200 },
        { month: 'Apr', users: 1800, sessions: 2900 },
        { month: 'May', users: 2400, sessions: 3800 }
    ];

    useEffect(() => {
        // Simulate API call
        const fetchAnalytics = async () => {
            try {
                // Replace with actual API call
                const mockData: AnalyticsData = {
                    totalUsers: 1250,
                    activeUsers: 320,
                    pageViews: 5420,
                    conversionRate: 3.2,
                };

                setTimeout(() => {
                    setData(mockData);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ fontSize: 18 }}>Loading analytics...</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <div style={{ width: 230, minHeight: '100vh', background: 'linear-gradient(180deg, rgba(255, 172, 128, 0) 1%, rgba(255, 172, 128, 0.30) 100%), white', boxShadow: '0px 4px 5px black', flexShrink: 0 }}>
                <div style={{ padding: 10, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex', height: '100%' }}>
                    {/* Logo */}
                    <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                        <div style={{ width: 20, height: 20, position: 'relative' }}>
                            <img style={{ width: 19.73, height: 19.73, left: 0, top: 0.28, position: 'absolute', transform: 'rotate(-1deg)', transformOrigin: 'top left' }} src="/images/logos/headword.png" alt="Logo" />
                        </div>
                        <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Headword!</div>
                    </div>

                    {/* Navigation Items */}
                    <Link href="/dashboard" style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
                        <div style={{ height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
                            <div style={{ width: 20, height: 20, position: 'relative' }}>
                                <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/dashboard.png" alt="Dashboard" />
                            </div>
                            <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Dashboard</div>
                        </div>
                    </Link>

                    {/* Analytics - Current Page (Highlighted) */}
                    <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, background: 'linear-gradient(90deg, rgba(255, 89, 0, 0.40) 0%, rgba(255, 255, 255, 0.40) 50%, rgba(255, 89, 0, 0.40) 100%), white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
                        <div style={{ width: 20, height: 20, position: 'relative' }}>
                            <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/analytics.png" alt="Analytics" />
                        </div>
                        <div style={{ color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Analytics</div>
                    </div>

                    <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, position: 'relative' }}>
                            <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/projects.png" alt="Projects" />
                        </div>
                        <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Projects</div>
                    </div>

                    <Link href="/dashboard/add-client" style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
                        <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
                            <div style={{ width: 20, height: 20, position: 'relative' }}>
                                <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/clients.png" alt="Clients" />
                            </div>
                            <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Clients</div>
                        </div>
                    </Link>

                    <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, position: 'relative' }}>
                            <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/invoices.png" alt="Invoices" />
                        </div>
                        <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Invoices</div>
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 23.60, position: 'relative', borderRadius: 10 }}>
                            <img style={{ width: 20, height: 23.60, left: 0, top: 0, position: 'absolute', borderRadius: 5 }} src="/images/images/account.png" alt="Account" />
                        </div>
                        <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Account</div>
                    </div>

                    <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, position: 'relative' }}>
                            <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/settings.png" alt="Settings" />
                        </div>
                        <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Settings</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(217, 217, 217, 0.15)', padding: '20px 20px 20px 30px', gap: '20px' }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Search Container */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        borderRadius: 25,
                        padding: '10px 20px',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        minWidth: '300px',
                        border: '1px solid #e0e0e0'
                    }}>
                        {/* Search Icon */}
                        <div style={{
                            width: 20,
                            height: 20,
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search analytics..."
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: 14,
                                flex: 1,
                                color: '#333',
                                fontFamily: 'Inter',
                                fontWeight: '400',
                                letterSpacing: 0
                            }}
                        />

                        {/* Clear/X Icon */}
                        <div style={{
                            width: 20,
                            height: 20,
                            marginLeft: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666',
                            borderRadius: '50%',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                                e.currentTarget.style.color = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#666';
                            }}
                            onClick={() => {
                                const input = document.querySelector('input[placeholder="Search analytics..."]') as HTMLInputElement;
                                if (input) input.value = '';
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Menu Dots */}
                    <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                    </div>
                </div>

                {/* Revenue Cards */}
                <div style={{ display: 'grid', gap: '28px', marginBottom: '30px', width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(366px, 1fr))', justifyItems: 'center' }}>
                    {/* Total Revenue Card 1 */}
                    <div style={{ minWidth: 366, height: 180, position: 'relative', background: 'white', borderRadius: 20, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ width: 60.16, height: 60.16, paddingLeft: 13, paddingRight: 13, paddingTop: 8, paddingBottom: 8, position: 'absolute', right: 44, top: 60, borderRadius: 100, border: '5px solid rgba(255, 89, 0, 0.50)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 20, fontFamily: 'Inter', fontWeight: '500' }}>#</div>
                        </div>
                        <div style={{ position: 'absolute', left: 6, top: 21, padding: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>Total Revenue </span>
                                <span style={{ color: '#00F5A0', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>+20%</span>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', left: 23, top: 90, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '500' }}>$28,431</div>
                            <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}># orders</div>
                        </div>
                    </div>

                    {/* Total Revenue Card 2 */}
                    <div style={{ minWidth: 366, height: 180, position: 'relative', background: 'white', borderRadius: 20, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ width: 60.16, height: 60.16, paddingLeft: 13, paddingRight: 13, paddingTop: 8, paddingBottom: 8, position: 'absolute', right: 44, top: 60, borderRadius: 100, border: '5px solid rgba(255, 89, 0, 0.50)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 20, fontFamily: 'Inter', fontWeight: '500' }}>#</div>
                        </div>
                        <div style={{ position: 'absolute', left: 6, top: 21, padding: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>Total Revenue </span>
                                <span style={{ color: '#FF0022', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>-20%</span>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', left: 23, top: 90, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '500' }}>$28,431</div>
                            <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}># orders</div>
                        </div>
                    </div>

                    {/* Total Revenue Card 3 */}
                    <div style={{ width: 366, height: 180, position: 'relative', background: 'white', borderRadius: 20, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ width: 60.16, height: 60.16, paddingLeft: 13, paddingRight: 13, paddingTop: 8, paddingBottom: 8, position: 'absolute', right: 44, top: 60, borderRadius: 100, border: '5px solid rgba(255, 89, 0, 0.50)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 20, fontFamily: 'Inter', fontWeight: '500' }}>#</div>
                        </div>
                        <div style={{ position: 'absolute', left: 6, top: 21, padding: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>Total Revenue </span>
                                <span style={{ color: '#00F5A0', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}>+20%</span>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', left: 23, top: 90, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '500' }}>$28,431</div>
                            <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 16, fontFamily: 'Inter', fontWeight: '500' }}># orders</div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '366px 1fr', gap: '28px', marginBottom: '30px' }}>
                    {/* Bar Chart */}
                    <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', height: '400px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <h3 style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', margin: 0, textAlign: 'center' }}>
                                Revenue by Month
                            </h3>
                        </div>

                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart
                                data={barChartData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                    labelFormatter={(label) => `Month: ${label}`}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="rgba(255, 89, 0, 0.80)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Line Chart */}
                    <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', height: '400px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <h3 style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', margin: 0, textAlign: 'center' }}>
                                User Growth
                            </h3>
                        </div>

                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart
                                data={lineChartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12, fill: '#666' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#666' }}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        value,
                                        name === 'users' ? 'Active Users' : 'Sessions'
                                    ]}
                                    labelFormatter={(label) => `Month: ${label}`}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="rgba(255, 89, 0, 0.80)"
                                    strokeWidth={3}
                                    dot={{ fill: 'rgba(255, 89, 0, 0.80)', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: 'rgba(255, 89, 0, 0.80)', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sessions"
                                    stroke="#00F5A0"
                                    strokeWidth={3}
                                    dot={{ fill: '#00F5A0', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#00F5A0', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Chart */}
                <div style={{ width: '100%', height: 237, background: '#D9D9D9', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#666', fontSize: 18, fontFamily: 'Inter' }}>Additional Chart Coming Soon</div>
                </div>
            </div>
        </div>
    );
}