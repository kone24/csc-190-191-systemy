"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  const tileStyle = (index: number): React.CSSProperties => ({
    minHeight: 150,
    padding: '25px',
    background: 'white',
    boxShadow: hoveredTile === index
      ? '0px 4px 10px 0px rgba(255, 172, 128, 1.00)'
      : '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    transition: 'box-shadow 300ms ease',
  });

  useEffect(() => {
    fetch('http://localhost:3001/clients', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data?.items)) throw new Error('Unexpected response shape');
        setClientCount(data.items.length);
      })
      .catch((err) => { console.error('Failed to fetch client count:', err); setClientCount(null); });
  }, []);

  // Add chart data
  const chartData = [
    { name: 'Task Type A', value: 10, color: '#537FF1' },
    { name: 'Task Type B', value: 20, color: '#FF928A' },
    { name: 'Task Type C', value: 40, color: '#8979FF' },
    { name: 'Task Type D', value: 12, color: '#FFAE4C' },
    { name: 'Task Type E', value: 18, color: '#3CC3DF' }
  ];
  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
      {/* Development Role Switcher */}
      <DevRoleSwitcher />
      
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(217, 217, 217, 0.15)', padding: '20px 20px 20px 30px', gap: '20px' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Search Container */}
          <SearchBar placeholder="Search clients, projects, and more..." onSearch={(value) => {
            // You can implement dashboard-wide search logic here
            // For now, we'll redirect to clients page with search functionality
            if (value.trim()) {
              window.location.href = `/dashboard/clients?search=${encodeURIComponent(value)}`;
            }
          }} />

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

        {/* Top Section - Stats Cards and Manage Projects */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '30px',
          marginBottom: '30px',
          alignItems: 'start'
        }}>
          {/* Stats Cards Grid - 2x2 Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '20px',
            width: '600px'
          }}>
            {/* Active Clients Card */}
            <div
              style={tileStyle(0)}
              onMouseEnter={() => setHoveredTile(0)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>Active Clients</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>{clientCount ?? '—'}</div>
              <div style={{ color: '#00F5A0', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>↑ 5% vs last week</div>
            </div>

            {/* Pending Invoices Card */}
            <div
              style={tileStyle(1)}
              onMouseEnter={() => setHoveredTile(1)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>Pending Invoices</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>67,670</div>
              <div style={{ color: '#FF928A', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>↓ 5% vs last week</div>
            </div>

            {/* Active Projects Card */}
            <div
              style={tileStyle(2)}
              onMouseEnter={() => setHoveredTile(2)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>Active Projects</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>67</div>
              <div></div>
            </div>

            {/* Productivity Card */}
            <div
              style={tileStyle(3)}
              onMouseEnter={() => setHoveredTile(3)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>Productivity</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>?</div>
              <div style={{ color: '#00F5A0', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600', wordWrap: 'break-word' }}>↑ 25% vs last week</div>
            </div>
          </div>

          {/* Manage Projects Panel */}
          <div style={{
            width: '100%',
            maxWidth: '95%',
            minHeight: 380,
            background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0.01) 0%, rgba(255, 89.25, 0, 0.05) 100%), white',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: 20,
            padding: '20px',
            position: 'relative'
          }}>
            <div style={{ textAlign: 'left', color: 'rgba(255, 89, 0, 0.80)', fontSize: 20, fontFamily: 'Poppins', fontWeight: '600', marginBottom: '20px' }}>Manage Projects</div>

            {/* Table Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 80px 80px 100px',
              gap: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #eee',
              marginBottom: '15px'
            }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Name</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Task</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Due on</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Price</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Status</div>
            </div>

            {/* Project Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Project Item 1 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 100px 1fr 80px 80px 100px',
                gap: '10px',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <img style={{ width: 40, height: 40, borderRadius: '50%' }} src="/images/images/client-1.png" alt="Client" />
                <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Client #22</div>
                <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>blah blah #1</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>Dec 31</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>$67</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                  </div>
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>High</div>
                </div>
              </div>

              {/* Project Item 2 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 100px 1fr 80px 80px 100px',
                gap: '10px',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <img style={{ width: 40, height: 40, borderRadius: '50%' }} src="/images/images/client-2.png" alt="Client" />
                <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Client #21</div>
                <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>blah blah #2</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>Nov 3</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>$512</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                  </div>
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>Medium</div>
                </div>
              </div>

              {/* Project Item 3 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 100px 1fr 80px 80px 100px',
                gap: '10px',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <img style={{ width: 40, height: 40, borderRadius: '50%' }} src="/images/images/client-1.png" alt="Client" />
                <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Client #3</div>
                <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>blah blah #3</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>Dec 31</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>$283</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                  </div>
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Poppins', fontWeight: '600' }}>Low</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Tasks and Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '600px 1fr',
          gap: '30px',
          marginBottom: '30px',
          alignItems: 'start'
        }}>
          {/* Upcoming Tasks Section */}
          <div style={{
            width: '95%',
            minHeight: 275,
            background: 'white',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: 20,
            padding: '20px'
          }}>
            {/* Tasks Header */}
            <div style={{ textAlign: 'center', color: 'rgba(255, 89, 0, 0.80)', fontSize: 25, fontFamily: 'Poppins', fontWeight: '600', marginBottom: '20px' }}>Upcoming Tasks</div>

            {/* Task Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/images/progress.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Send Campaign debrief</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/images/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/images/progress.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Review Design Draft</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/images/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/images/progress.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Approve Invoice #</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/images/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Poppins', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section - REPLACE THIS ENTIRE SECTION */}
          <div style={{
            minHeight: 275,
            background: 'white',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: 20,
            padding: '20px',
            position: 'relative'
          }}>
            {/* Chart Title */}
            <div style={{ fontSize: 20, fontFamily: 'Poppins', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: '20px', textAlign: 'center' }}>
              Statistics
            </div>

            {/* Interactive Pie Chart */}
            <ResponsiveContainer width="90%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={30}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                    // Find the corresponding data item to get the percentage
                    const dataItem = chartData.find(item => item.name === value);
                    const percentage = dataItem ? dataItem.value : 0;

                    return (
                      <span style={{
                        fontSize: 10,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        color: 'black'
                      }}>
                        {percentage}% {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* End Main Content Area */}
        </div>
        {/* Weekly Performance Section - Full Width Below */}
        <div style={{
          width: '100%',
          marginBottom: '30px'
        }}>
          {/* Weekly Chart */}
          <div style={{
            width: '98%',
            minHeight: 248,
            background: 'white',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: 20,
            padding: '20px',
            position: 'relative',
            marginBottom: '20px'
          }}>
            {/* Chart Title */}
            <div style={{ fontSize: 20, fontFamily: 'Poppins', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: '20px', textAlign: 'center' }}>Weekly Performance</div>

            {/* Chart Placeholder */}
            <div style={{
              width: '100%',
              height: 150,
              background: '#f8f8f8',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ color: '#999', fontSize: 16, fontFamily: 'Poppins' }}>Chart Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}