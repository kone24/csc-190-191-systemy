"use client";

import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
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
      {/* Sidebar */}
      <div style={{
        width: 230,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(255, 172, 128, 0) 1%, rgba(255, 172, 128, 0.40) 100%), white',
        boxShadow: '0px 4px 5px black',
        flexShrink: 0,
      }}>
        {/* Sidebar Navigation Content */}
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
            <div style={{ height: 61.10, padding: 10, background: 'linear-gradient(90deg, rgba(255, 89, 0, 0.40) 0%, rgba(255, 255, 255, 0.40) 100%, rgba(255, 89, 0, 0.40) 100%), white', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 20, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex' }}>
              <div style={{ width: 20, height: 20, position: 'relative' }}>
                <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/dashboard.png" alt="Dashboard" />
              </div>
              <div style={{ color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Dashboard</div>
            </div>
          </Link>

          <Link href="/dashboard/analytics" style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
            <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, borderRadius: 20, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, position: 'relative' }}>
                <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/analytics.png" alt="Analytics" />
              </div>
              <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Analytics</div>
            </div>
          </Link>

          <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, position: 'relative' }}>
              <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/projects.png" alt="Projects" />
            </div>
            <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Projects</div>
          </div>

          <Link href="/dashboard/add-client" style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
            <div style={{ height: 61.10, padding: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
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

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom Navigation */}
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
            <div style={{
              minHeight: 150,
              padding: '25px',
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 15
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>Active Clients</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>26</div>
              <div style={{ color: '#00F5A0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>↑ 5% vs last week</div>
            </div>

            {/* Pending Invoices Card */}
            <div style={{
              minHeight: 150,
              padding: '25px',
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 15
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>Pending Invoices</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>67,670</div>
              <div style={{ color: '#FF928A', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>↓ 5% vs last week</div>
            </div>

            {/* Active Projects Card */}
            <div style={{
              minHeight: 150,
              padding: '25px',
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 15
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>Active Projects</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>67</div>
              <div></div>
            </div>

            {/* Productivity Card */}
            <div style={{
              minHeight: 150,
              padding: '25px',
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 15
            }}>
              <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.60)', fontSize: 18, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>Productivity</div>
              <div style={{ opacity: 0.90, textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>?</div>
              <div style={{ color: '#00F5A0', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>↑ 25% vs last week</div>
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
            <div style={{ textAlign: 'left', color: 'rgba(255, 89, 0, 0.80)', fontSize: 20, fontFamily: 'Inter', fontWeight: '600', marginBottom: '20px' }}>Manage Projects</div>

            {/* Table Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 80px 80px 100px',
              gap: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #eee',
              marginBottom: '15px'
            }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>Name</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>Task</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>Due on</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>Price</div>
              <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>Status</div>
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
                <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Client #22</div>
                <div style={{ color: 'black', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>blah blah #1</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Dec 31</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>$67</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#FF5900', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                  </div>
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>High</div>
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
                <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Client #21</div>
                <div style={{ color: 'black', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>blah blah #2</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Nov 3</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>$512</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                  </div>
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Medium</div>
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
                <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Client #3</div>
                <div style={{ color: 'black', fontSize: 12, fontFamily: 'Inter', fontWeight: '600' }}>blah blah #3</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Dec 31</div>
                <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>$283</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #FF5900 0%, white 100%)', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                    <div style={{ width: 3, height: 16, background: '#D9D9D9', borderRadius: 2 }} />
                  </div>
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Low</div>
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
            <div style={{ textAlign: 'center', color: 'rgba(255, 89, 0, 0.80)', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', marginBottom: '20px' }}>Upcoming Tasks</div>

            {/* Task Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/images/progress.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Send Campaign debrief</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/images/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/images/progress.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Review Design Draft</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/images/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/images/progress.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Approve Invoice #</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/images/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Oct 3</div>
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
            <div style={{ fontSize: 20, fontFamily: 'Inter', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: '20px', textAlign: 'center' }}>
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
                        fontFamily: 'Inter',
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
            <div style={{ fontSize: 20, fontFamily: 'Inter', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: '20px', textAlign: 'center' }}>Weekly Performance</div>

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
              <div style={{ color: '#999', fontSize: 16, fontFamily: 'Inter' }}>Chart Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}