"use client";

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
      {/* Sidebar */}
      <div style={{
        width: 230,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(255, 172, 128, 0) 1%, rgba(255, 172, 128, 0.40) 100%), white',
        boxShadow: '0px 4px 5px black',
        flexShrink: 0
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

          <div style={{ alignSelf: 'stretch', height: 61.10, padding: 10, borderRadius: 20, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, position: 'relative' }}>
              <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src="/images/icons/analytics.png" alt="Analytics" />
            </div>
            <div style={{ opacity: 0.75, color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '500', wordWrap: 'break-word' }}>Analytics</div>
          </div>

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
              <img style={{ width: 20, height: 23.60, left: 0, top: 0, position: 'absolute', borderRadius: 5 }} src="/images/icons/account.png" alt="Account" />
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
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(217, 217, 217, 0.15)',
        padding: '20px 20px 20px 5px',
        gap: '20px'
      }}>

        {/* Top Bar with Search and Menu */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: 25,
            padding: '10px 20px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            minWidth: '300px'
          }}>
            <img style={{ width: 20, height: 20, marginRight: '10px' }} src="/images/icons/search.png" alt="Search" />
            <input
              type="text"
              placeholder="Search..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 16,
                flex: 1
              }}
            />
          </div>

          <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 5, display: 'flex' }}>
            <div style={{ width: 15, height: 15, background: '#D9D9D9', borderRadius: '50%' }} />
            <div style={{ width: 15, height: 15, background: '#D9D9D9', borderRadius: '50%' }} />
            <div style={{ width: 15, height: 15, background: '#D9D9D9', borderRadius: '50%' }} />
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
            maxWidth: '600px',
            minHeight: 328,
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
                <img style={{ width: 40, height: 40, borderRadius: '50%' }} src="/images/avatars/client1.png" alt="Client" />
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
                <img style={{ width: 40, height: 40, borderRadius: '50%' }} src="/images/avatars/client2.png" alt="Client" />
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
                <img style={{ width: 40, height: 40, borderRadius: '50%' }} src="/images/avatars/client3.png" alt="Client" />
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
          gridTemplateColumns: 'auto 1fr',
          gap: '30px',
          marginBottom: '30px',
          alignItems: 'start'
        }}>
          {/* Upcoming Tasks Section */}
          <div style={{
            width: '600px',
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
                  <img style={{ width: 28, height: 28 }} src="/images/icons/task.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Send Campaign debrief</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/icons/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/icons/task.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Review Design Draft</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/icons/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 28, height: 28 }} src="/images/icons/task.png" alt="Task" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Approve Invoice #</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img style={{ width: 30, height: 30 }} src="/images/icons/calendar.png" alt="Calendar" />
                  <div style={{ color: 'black', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' }}>Oct 3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div style={{
            minHeight: 275,
            background: 'white',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: 20,
            padding: '20px',
            position: 'relative'
          }}>
            {/* Chart Title */}
            <div style={{ fontSize: 20, fontFamily: 'Inter', fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: '20px', textAlign: 'center' }}>Statistics</div>

            {/* Chart Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#537FF1', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>10% blah</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#FF928A', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>20% blah blah</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#8979FF', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>40% blahf dfdf</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#FFAE4C', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>12% blah dfdfdf</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#3CC3DF', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>18% blah dfdssa</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: 'white', border: '1px solid #ddd', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Medium</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#FFE4E1', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>High</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, background: '#F0F8FF', borderRadius: '50%' }} />
                  <div style={{ color: 'black', fontSize: 10, fontFamily: 'Inter', fontWeight: '600' }}>Low</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance Section - Full Width Below */}
        <div style={{
          width: '100%',
          marginBottom: '30px'
        }}>
          {/* Weekly Chart */}
          <div style={{
            width: '100%',
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

        {/* End Main Content Area */}
      </div>
    </div>
  );
}