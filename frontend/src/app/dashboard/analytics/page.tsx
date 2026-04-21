'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { usePermissions } from '@/components/RoleGuard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

type RangeOption = '7d' | '30d' | '90d' | '1y' | 'all';

interface SummaryData {
  totalRevenue: number;
  totalClients: number;
  newClients: number;
  invoiceCount: number;
  conversionRate: number;
  revenueChange: number;
  clientChange: number;
}

interface RevenueMonth {
  month: string;
  revenue: number;
}

interface ClientGrowthMonth {
  month: string;
  clients: number;
}

interface InvoiceStatus {
  paid: number;
  unpaid: number;
  overdue: number;
  cancelled: number;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const RANGE_OPTIONS: { label: string; value: RangeOption }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];

const PIE_COLORS: Record<string, string> = {
  Paid: '#FF5900',
  Unpaid: '#B0B0B0',
  Overdue: '#FF0022',
  Cancelled: '#1A1A1A',
};

export default function AnalyticsPage() {
  const { canViewReports } = usePermissions();
  const router = useRouter();
  const [range, setRange] = useState<RangeOption>('30d');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([]);
  const [clientData, setClientData] = useState<ClientGrowthMonth[]>([]);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const opts: RequestInit = { credentials: 'include' };
      const qs = `?range=${range}`;

      const [summaryRes, revenueRes, clientRes, invoiceRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/summary${qs}`, opts),
        fetch(`${API_BASE}/analytics/revenue-by-month${qs}`, opts),
        fetch(`${API_BASE}/analytics/client-growth${qs}`, opts),
        fetch(`${API_BASE}/analytics/invoice-status${qs}`, opts),
      ]);

      if (summaryRes.status === 401) {
        router.push('/login?from=/dashboard/analytics');
        return;
      }

      if (!summaryRes.ok || !revenueRes.ok || !clientRes.ok || !invoiceRes.ok) {
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
        return;
      }

      const [summaryJson, revenueJson, clientJson, invoiceJson] = await Promise.all([
        summaryRes.json(),
        revenueRes.json(),
        clientRes.json(),
        invoiceRes.json(),
      ]);

      setSummary(summaryJson.data);
      setRevenueData(revenueJson.data);
      setClientData(clientJson.data);
      setInvoiceStatus(invoiceJson.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (canViewReports) {
      fetchAnalytics();
    }
  }, [canViewReports, fetchAnalytics]);

  if (!canViewReports) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
        <Sidebar activePage="analytics" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(217, 217, 217, 0.15)', padding: '20px' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333', fontFamily: 'Poppins' }}>Access Denied</div>
          <div style={{ fontSize: 16, color: '#666', maxWidth: 400, textAlign: 'center', fontFamily: 'Poppins' }}>
            You don&apos;t have permission to view analytics. Please contact your administrator.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
        <Sidebar activePage="analytics" />
        <div style={{ flex: 1, marginLeft: 320, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'rgba(217, 217, 217, 0.15)', padding: '20px 20px 20px 30px', gap: '20px' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <SearchBar placeholder="Search analytics..." onSearch={() => {}} />
          </div>
          {/* Skeleton cards */}
          <div style={{ display: 'grid', gap: 28, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 160, background: '#e9e9e9', borderRadius: 20, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
          {/* Skeleton charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 10 }}>
            <div style={{ height: 400, background: '#e9e9e9', borderRadius: 20, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 400, background: '#e9e9e9', borderRadius: 20, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
        <Sidebar activePage="analytics" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(217, 217, 217, 0.15)', padding: '20px' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333', fontFamily: 'Poppins' }}>{error}</div>
          <button
            onClick={fetchAnalytics}
            style={{ marginTop: 10, padding: '10px 24px', background: '#FF5900', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', fontFamily: 'Poppins' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pieData = invoiceStatus
    ? [
        { name: 'Paid', value: invoiceStatus.paid },
        { name: 'Unpaid', value: invoiceStatus.unpaid },
        { name: 'Overdue', value: invoiceStatus.overdue },
        { name: 'Cancelled', value: invoiceStatus.cancelled },
      ].filter((d) => d.value > 0)
    : [];

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const changeColor = (val: number) => (val >= 0 ? '#00F5A0' : '#FF0022');
  const changePrefix = (val: number) => (val >= 0 ? '+' : '');

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
      {/* Sidebar */}
      <Sidebar activePage="analytics" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: 320, display: 'flex', flexDirection: 'column', background: 'rgba(217, 217, 217, 0.15)', padding: '20px 20px 20px 30px', gap: '20px', overflowX: 'hidden' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SearchBar placeholder="Search analytics..." onSearch={() => {}} />
        </div>

        {/* Date Range Filter Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: range === opt.value ? '2px solid #FF5900' : '1px solid #ccc',
                background: range === opt.value ? 'rgba(255, 89, 0, 0.10)' : 'white',
                color: range === opt.value ? '#FF5900' : '#666',
                fontFamily: 'Poppins',
                fontWeight: range === opt.value ? '600' : '400',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {/* Total Revenue Card */}
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', marginBottom: 2 }}>Total Revenue</div>
                <span style={{ color: changeColor(summary?.revenueChange || 0), fontSize: 13, fontFamily: 'Poppins', fontWeight: '600' }}>
                  {changePrefix(summary?.revenueChange || 0)}{summary?.revenueChange || 0}% vs last period
                </span>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '4px solid rgba(255, 89, 0, 0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600' }}>$</span>
              </div>
            </div>
            <div>
              <div style={{ color: 'black', fontSize: 28, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 4 }}>{formatCurrency(summary?.totalRevenue || 0)}</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '400' }}>{summary?.invoiceCount || 0} invoices</div>
            </div>
          </div>

          {/* New Clients Card */}
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', marginBottom: 2 }}>New Clients</div>
                <span style={{ color: changeColor(summary?.clientChange || 0), fontSize: 13, fontFamily: 'Poppins', fontWeight: '600' }}>
                  {changePrefix(summary?.clientChange || 0)}{summary?.clientChange || 0}% vs last period
                </span>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '4px solid rgba(255, 89, 0, 0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 18 }}>👤</span>
              </div>
            </div>
            <div>
              <div style={{ color: 'black', fontSize: 28, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 4 }}>{summary?.newClients || 0}</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '400' }}>{summary?.totalClients || 0} total clients</div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'rgba(0, 0, 0, 0.50)', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', marginBottom: 2 }}>Conversion Rate</div>
                <span style={{ color: 'rgba(0, 0, 0, 0.35)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '400' }}>paid / total invoices</span>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '4px solid rgba(255, 89, 0, 0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600' }}>%</span>
              </div>
            </div>
            <div>
              <div style={{ color: 'black', fontSize: 28, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 4 }}>{summary?.conversionRate || 0}%</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '400' }}>of invoices fulfilled</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '30px' }}>
          {/* Revenue by Month — Bar Chart */}
          <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', height: '400px' }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', margin: 0, textAlign: 'center' }}>
                Revenue by Month
              </h3>
            </div>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="rgba(255, 89, 0, 0.80)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Poppins' }}>
                No revenue data for this period
              </div>
            )}
          </div>

          {/* Client Growth — Line Chart */}
          <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', height: '400px' }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', margin: 0, textAlign: 'center' }}>
                Client Growth
              </h3>
            </div>
            {clientData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={clientData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [value, 'New Clients']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="rgba(255, 89, 0, 0.80)"
                    strokeWidth={3}
                    dot={{ fill: 'rgba(255, 89, 0, 0.80)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'rgba(255, 89, 0, 0.80)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Poppins' }}>
                No client data for this period
              </div>
            )}
          </div>
        </div>

        {/* Invoice Status — Pie Chart */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', minHeight: 275, position: 'relative' }}>
          <div style={{ fontSize: 20, fontFamily: 'Poppins', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: '20px', textAlign: 'center' }}>
            Invoice Status Breakdown
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="90%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={30}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ right: 200, top: 50 }}
                  formatter={(value) => {
                    const dataItem = pieData.find(item => item.name === value);
                    const count = dataItem ? dataItem.value : 0;
                    return (
                      <span style={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', color: 'black' }}>
                        {count} {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Poppins' }}>
              No invoice data for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}