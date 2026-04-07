"use client";

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';
import { useUser } from '@/contexts/UserContext';

export default function DashboardPage() {
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredGantt, setHoveredGantt] = useState(false);
  const [sortByDate, setSortByDate] = useState(false);
  const { user } = useUser();
  const isAdminOrManager = user?.role === 'Administrator' || user?.role === 'Manager';
  const [taskView, setTaskView] = useState<'my' | 'company'>('my');
  useEffect(() => {
    if (isAdminOrManager) setTaskView('company');
  }, [isAdminOrManager]);

  const tileStyle = (index: number, borderColor: string, shadowColor: string): React.CSSProperties => ({
    minHeight: 140,
    boxShadow: hoveredTile === index
      ? `0px 4px 10px 0px ${shadowColor}`
      : '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    borderBottom: `3px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'box-shadow 300ms ease',
  });

  const kpiColors = {
    activeProjects: { border: '#FFAC80',  shadow: 'rgba(255, 172, 128, 0.6)' },
    activeContacts: { border: '#00F5A0',  shadow: 'rgba(0, 245, 160, 0.6)'   },
    tasksDue:       { border: '#FF928A',  shadow: 'rgba(255, 146, 138, 0.6)' },
    openInvoices:   { border: '#FFF642',  shadow: 'rgba(255, 246, 66, 0.6)'  },
    comingSoon:     { border: '#8979FF',  shadow: 'rgba(137, 121, 255, 0.6)' },
  };

  const tileTopZone: React.CSSProperties = {
    background: '#fef0e6',
    borderBottom: '1px solid #fde8d8',
    padding: '12px 25px',
    textAlign: 'center',
  };

  const tileLabelStyle: React.CSSProperties = {
    color: '#7c3a0a',
    fontSize: 15,
    fontFamily: 'Poppins',
    fontWeight: 500,
  };

  const tileBodyZone: React.CSSProperties = {
    background: 'white',
    padding: '24px 25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flex: 1,
  };

  const badgeStyle = (bg: string, text: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '6px 20px',
    borderRadius: 20,
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    background: bg,
    color: text,
  });

  const priorityColors: Record<string, { bg: string; text: string }> = {
    High: { bg: '#FFAC80',                  text: 'black' },
    Med:  { bg: 'rgba(255, 246, 66, 0.32)', text: 'black' },
    Low:  { bg: '#00F5A0',                  text: 'black' },
  };

  const projectStatusColors: Record<string, { bg: string; text: string }> = {
    'On Track':  { bg: '#22C55E', text: 'black' },
    'At Risk':   { bg: '#F59E0B', text: 'black' },
    'On Hold':   { bg: '#FF5900', text: 'white' },
    'Behind':    { bg: '#EF4444', text: 'white' },
    'Completed': { bg: '#9CA3AF', text: 'white' },
    'Cancelled': { bg: '#EF4444', text: 'white' },
  };

  const projectRows = [
    { project: 'Website Rebrand', task: 'Design Sprint', assignee: 'Jez K.',    assigneeInitials: 'JK', assigneeBg: '#f97316', due: 'Dec 31', status: 'On Track' },
    { project: 'Q1 Campaign',     task: 'Research',      assignee: 'Rachel S.', assigneeInitials: 'RS', assigneeBg: '#8979FF', due: 'Jan 10', status: 'On Hold' },
    { project: 'App Launch',      task: 'Build',         assignee: 'Matthew T.',assigneeInitials: 'MT', assigneeBg: '#00C980', due: 'Jan 20', status: 'At Risk' },
    { project: 'Brand Refresh',   task: 'Strategy',      assignee: 'Ashley S.', assigneeInitials: 'AS', assigneeBg: '#537FF1', due: 'Feb 5',  status: 'Behind' },
    { project: 'Case Study',      task: 'Copywriting',   assignee: 'Xavier M.', assigneeInitials: 'XM', assigneeBg: '#FF928A', due: 'Mar 1',  status: 'On Track' },
    { project: 'App Launch',      task: 'QA Testing',    assignee: 'Rachel S.', assigneeInitials: 'RS', assigneeBg: '#8979FF', due: 'Mar 15', status: 'Completed' },
  ];

  const adminMyTasks = [
    { name: 'Send Campaign debrief', priority: 'High', due: 'Oct 3', sortKey: 3 },
    { name: 'Review Design Draft', priority: 'Med', due: 'Oct 4', sortKey: 4 },
    { name: 'Approve Invoice', priority: 'Low', due: 'Oct 5', sortKey: 5 },
    { name: 'Client Check-in', priority: 'High', due: 'Oct 6', sortKey: 6 },
    { name: 'Update Content Brief', priority: 'Med', due: 'Oct 7', sortKey: 7 },
    { name: 'Team Sync Prep', priority: 'Low', due: 'Oct 8', sortKey: 8 },
    { name: 'Finalize Q2 Budget', priority: 'High', due: 'Oct 9', sortKey: 9 },
  ];

  const userMyTasks = [
    { name: 'Send Campaign debrief', project: 'Website Rebrand', priority: 'High', due: 'Oct 3', sortKey: 3 },
    { name: 'Review Design Draft',   project: 'Q1 Campaign',     priority: 'Med',  due: 'Oct 4', sortKey: 4 },
    { name: 'Approve Invoice',       project: 'App Launch',      priority: 'Low',  due: 'Oct 5', sortKey: 5 },
    { name: 'Client Check-in',       project: 'Brand Refresh',   priority: 'High', due: 'Oct 6', sortKey: 6 },
    { name: 'Update Content Brief',  project: 'Q1 Campaign',     priority: 'Med',  due: 'Oct 7', sortKey: 7 },
    { name: 'Prepare Slide Deck',    project: 'Website Rebrand', priority: 'High', due: 'Oct 8', sortKey: 8 },
  ];

  const companyTasks = [
    { name: 'Send Campaign debrief', project: 'Website Rebrand', assignee: 'Jez K.', priority: 'High', due: 'Oct 3', sortKey: 3 },
    { name: 'Review Design Draft', project: 'Q1 Campaign', assignee: 'Rachel S.', priority: 'Med', due: 'Oct 4', sortKey: 4 },
    { name: 'Brand Refresh', project: 'Brand Refresh', assignee: 'Matthew T.', priority: 'Low', due: 'Oct 5', sortKey: 5 },
    { name: 'Client Onboarding', project: 'App Launch', assignee: 'Ashley S.', priority: 'High', due: 'Oct 6', sortKey: 6 },
    { name: 'Write Case Study', project: 'Q1 Campaign', assignee: 'Xavier M.', priority: 'Med', due: 'Oct 7', sortKey: 7 },
    { name: 'Team Sync Prep', project: 'Case Study', assignee: 'Jez K.', priority: 'Low', due: 'Oct 8', sortKey: 8 },
    { name: 'Finalize Q2 Budget', project: 'App Launch', assignee: 'Ashley S.', priority: 'High', due: 'Oct 9', sortKey: 9 },
  ];

  const myTasks = isAdminOrManager ? adminMyTasks : userMyTasks;
  const currentTasks = taskView === 'my' ? myTasks : companyTasks;
  const displayTasks = sortByDate
    ? [...currentTasks].sort((a, b) => a.sortKey - b.sortKey)
    : currentTasks;

  const weekDays = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]} ${d.getMonth() + 1}/${d.getDate()}`;
    });
  }, []);

  const ganttRows = [
    { name: 'Jez K.', initials: 'JK', avatarBg: '#f97316', bars: [{ label: 'Website Rebrand', start: 0, end: 3, color: '#FFAC80' }] },
    { name: 'Rachel S.', initials: 'RS', avatarBg: '#8979FF', bars: [{ label: 'OOO', start: 1, end: 2, color: '#d1d5db' }, { label: 'Q1 Campaign', start: 3, end: 4, color: 'rgba(91, 66, 255, 0.4)' }] },
    { name: 'Matthew T.', initials: 'MT', avatarBg: '#00C980', bars: [{ label: 'App Launch', start: 0, end: 4, color: '#00F5A0' }] },
    { name: 'Ashley S.', initials: 'AS', avatarBg: '#537FF1', bars: [{ label: 'Brand Refresh', start: 0, end: 4, color: '#FFAC80' }] },
    { name: 'Xavier M.', initials: 'XM', avatarBg: '#FF928A', bars: [{ label: 'OOO', start: 0, end: 1, color: '#d1d5db' }, { label: 'Case Study', start: 2, end: 4, color: 'rgba(255, 246, 66, 0.6)' }] },
  ];
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'white', overflow: 'hidden' }}>
      {/* Development Role Switcher */}
      <DevRoleSwitcher />

      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(217, 217, 217, 0.15)', padding: '20px 20px 20px 30px', gap: '20px' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          {/* Search Container */}
          <div style={{ flex: 1 }}>
            <SearchBar placeholder="Search contacts, projects, and more..." onSearch={(value) => {
              if (value.trim()) {
                window.location.href = `/dashboard/clients?search=${encodeURIComponent(value)}`;
              }
            }} />
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

        {/* KPI Tiles — full width row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isAdminOrManager ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {/* Active Projects */}
          <div style={tileStyle(0, kpiColors.activeProjects.border, kpiColors.activeProjects.shadow)} onMouseEnter={() => setHoveredTile(0)} onMouseLeave={() => setHoveredTile(null)}>
            <div style={{ ...tileTopZone, background: '#FFAC80', borderBottom: '1px solid #f97316' }}><span style={{ ...tileLabelStyle, color: '#7c2d12' }}>Active Projects</span></div>
            <div style={tileBodyZone}>
              <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>67</div>
            </div>
          </div>

          {isAdminOrManager ? (
            <>
              {/* Active Contacts */}
              <div style={tileStyle(1, kpiColors.activeContacts.border, kpiColors.activeContacts.shadow)} onMouseEnter={() => setHoveredTile(1)} onMouseLeave={() => setHoveredTile(null)}>
                <div style={{ ...tileTopZone, background: '#00F5A0', borderBottom: '1px solid #00C980' }}><span style={{ ...tileLabelStyle, color: '#065f46' }}>Active Contacts</span></div>
                <div style={tileBodyZone}>
                  <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>28</div>
                </div>
              </div>

              {/* Tasks Due This Week */}
              <div style={tileStyle(2, kpiColors.tasksDue.border, kpiColors.tasksDue.shadow)} onMouseEnter={() => setHoveredTile(2)} onMouseLeave={() => setHoveredTile(null)}>
                <div style={{ ...tileTopZone, background: '#FF928A', borderBottom: '1px solid #ef4444' }}><span style={{ ...tileLabelStyle, color: '#7f1d1d' }}>Tasks Due This Week</span></div>
                <div style={tileBodyZone}>
                  <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>14</div>
                  <div style={badgeStyle('rgba(239, 68, 68, 0.15)', '#dc2626')}>3 overdue</div>
                </div>
              </div>

              {/* Open Invoices */}
              <div style={tileStyle(3, kpiColors.openInvoices.border, kpiColors.openInvoices.shadow)} onMouseEnter={() => setHoveredTile(3)} onMouseLeave={() => setHoveredTile(null)}>
                <div style={{ ...tileTopZone, background: 'rgba(255, 246, 66, 0.6)', borderBottom: '1px solid rgba(220, 200, 0, 0.8)' }}><span style={{ ...tileLabelStyle, color: '#713f12' }}>Open Invoices</span></div>
                <div style={tileBodyZone}>
                  <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>4</div>
                  <div style={badgeStyle('rgba(245, 158, 11, 0.15)', '#d97706')}>1 overdue</div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Coming Soon placeholder */}
              <div style={tileStyle(1, kpiColors.comingSoon.border, kpiColors.comingSoon.shadow)} onMouseEnter={() => setHoveredTile(1)} onMouseLeave={() => setHoveredTile(null)}>
                <div style={{ ...tileTopZone, background: 'rgba(137, 121, 255, 0.4)', borderBottom: '1px solid #8979FF' }}><span style={{ ...tileLabelStyle, color: '#3730a3' }}>Coming Soon</span></div>
                <div style={tileBodyZone}>
                  <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>—</div>
                </div>
              </div>

              {/* My Tasks Due */}
              <div style={tileStyle(2, kpiColors.tasksDue.border, kpiColors.tasksDue.shadow)} onMouseEnter={() => setHoveredTile(2)} onMouseLeave={() => setHoveredTile(null)}>
                <div style={{ ...tileTopZone, background: '#FF928A', borderBottom: '1px solid #ef4444' }}><span style={{ ...tileLabelStyle, color: '#7f1d1d' }}>My Tasks Due</span></div>
                <div style={tileBodyZone}>
                  <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>5</div>
                  <div style={badgeStyle('rgba(239, 68, 68, 0.15)', '#dc2626')}>1 overdue</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Section — layout depends on role */}
        {isAdminOrManager ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'stretch', minHeight: 0 }}>
            {/* Upcoming Tasks Section */}
            <div style={{
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              padding: '20px'
            }}>
              {/* Header: toggle + sort */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setTaskView('my')} style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontFamily: 'Poppins', fontWeight: 600, cursor: 'pointer',
                    border: taskView === 'my' ? 'none' : '1.5px solid #f97316',
                    background: taskView === 'my' ? '#f97316' : 'transparent',
                    color: taskView === 'my' ? 'white' : '#f97316',
                  }}>My Tasks</button>
                  <button onClick={() => setTaskView('company')} style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontFamily: 'Poppins', fontWeight: 600, cursor: 'pointer',
                    border: taskView === 'company' ? 'none' : '1.5px solid #f97316',
                    background: taskView === 'company' ? '#f97316' : 'transparent',
                    color: taskView === 'company' ? 'white' : '#f97316',
                  }}>Company Wide</button>
                </div>
                <button onClick={() => setSortByDate(prev => !prev)} style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'Poppins', fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid #d1d5db', background: sortByDate ? '#f3f4f6' : 'transparent', color: '#374151',
                }}>Sort by Date</button>
              </div>
              {/* Task rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayTasks.map((task, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ flex: 1, color: 'black', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600' }}>{task.name}</div>
                    {'assignee' in task && <div style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500', marginRight: 10 }}>{(task as typeof companyTasks[number]).assignee}</div>}
                    <span style={{ ...badgeStyle(priorityColors[task.priority].bg, priorityColors[task.priority].text), marginRight: 12 }}>{task.priority}</span>
                    <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '500', minWidth: 45, textAlign: 'right' }}>{task.due}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Projects Panel */}
            <div style={{
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              padding: '20px',
            }}>
              <div style={{ color: 'rgba(255, 89, 0, 0.80)', fontSize: 20, fontFamily: 'Poppins', fontWeight: '600', marginBottom: '20px' }}>Manage Projects</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 90px 100px', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Project</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Task</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Assignee</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Due Date</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Status</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {projectRows.map((row, i) => (
                  <div
                    key={i}
                    onClick={() => { window.location.href = '/dashboard/projects'; }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 140px 90px 100px',
                      gap: '10px',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: hoveredRow === i ? '#fafafa' : 'transparent',
                      transition: 'background 150ms ease',
                    }}
                  >
                    <div style={{ color: 'black', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600' }}>{row.project}</div>
                    <div style={{ color: 'black', fontSize: 13, fontFamily: 'Poppins', fontWeight: '500' }}>{row.task}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: row.assigneeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Poppins', fontWeight: 700, color: 'white', flexShrink: 0 }}>{row.assigneeInitials}</div>
                      <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.assignee}</div>
                    </div>
                    <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.due}</div>
                    <div><span style={{ ...badgeStyle(projectStatusColors[row.status].bg, projectStatusColors[row.status].text), padding: '6px 10px' }}>{row.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Management — mini Gantt preview */}
          <div
            onClick={() => { window.location.href = '/dashboard/gantt'; }}
            onMouseEnter={() => setHoveredGantt(true)}
            onMouseLeave={() => setHoveredGantt(false)}
            style={{
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              padding: '20px',
              cursor: 'pointer',
              border: hoveredGantt ? '1.5px solid #f97316' : '1.5px solid transparent',
              transition: 'border-color 200ms ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ color: 'rgba(255, 89, 0, 0.80)', fontSize: 20, fontFamily: 'Poppins', fontWeight: '600' }}>Gantt</div>
              <span style={{ color: '#f97316', fontSize: 13, fontFamily: 'Poppins', fontWeight: 600 }}>View full Gantt →</span>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(5, 1fr)', gap: 0 }}>
              <div />
              {weekDays.map((d, i) => (
                <div key={i} style={{
                  textAlign: 'center', fontSize: 11, fontFamily: 'Poppins', fontWeight: 600,
                  color: 'rgba(0,0,0,0.5)', paddingBottom: 8,
                  borderBottom: '1px solid #e8e8e8',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Gantt rows */}
            {ganttRows.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', borderBottom: ri < ganttRows.length - 1 ? '1px solid #f0f0f0' : 'none', padding: '10px 0' }}>
                {/* Name cell */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: row.avatarBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontFamily: 'Poppins', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {row.initials}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'Poppins', fontWeight: 600, color: 'black' }}>{row.name}</div>
                </div>
                {/* Timeline area */}
                <div style={{ position: 'relative', height: 32 }}>
                  {/* Column gridlines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {[0,1,2,3,4].map(c => (
                      <div key={c} style={{ borderLeft: c > 0 ? '1px solid #e8e8e8' : 'none' }} />
                    ))}
                  </div>
                  {/* Bars */}
                  {row.bars.map((bar, bi) => (
                    <div key={bi} style={{
                      position: 'absolute',
                      top: 4, bottom: 4,
                      left: `${(bar.start / 5) * 100}%`,
                      width: `${((bar.end - bar.start + 1) / 5) * 100}%`,
                      background: bar.color,
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', paddingLeft: 8,
                      fontSize: 11, fontFamily: 'Poppins', fontWeight: 600,
                      color: bar.color === '#d1d5db' ? '#6b7280' : 'black',
                      overflow: 'hidden', whiteSpace: 'nowrap',
                    }}>
                      {bar.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
            {/* Upcoming Tasks Section — full width */}
            <div style={{
              flex: 1,
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              padding: '20px'
            }}>
              {/* Header: toggle + sort */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setTaskView('my')} style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontFamily: 'Poppins', fontWeight: 600, cursor: 'pointer',
                    border: taskView === 'my' ? 'none' : '1.5px solid #f97316',
                    background: taskView === 'my' ? '#f97316' : 'transparent',
                    color: taskView === 'my' ? 'white' : '#f97316',
                  }}>My Tasks</button>
                  <button onClick={() => setTaskView('company')} style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontFamily: 'Poppins', fontWeight: 600, cursor: 'pointer',
                    border: taskView === 'company' ? 'none' : '1.5px solid #f97316',
                    background: taskView === 'company' ? '#f97316' : 'transparent',
                    color: taskView === 'company' ? 'white' : '#f97316',
                  }}>Company Wide</button>
                </div>
                <button onClick={() => setSortByDate(prev => !prev)} style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'Poppins', fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid #d1d5db', background: sortByDate ? '#f3f4f6' : 'transparent', color: '#374151',
                }}>Sort by Date</button>
              </div>
              {/* Task rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayTasks.map((task, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ flex: 1, color: 'black', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600' }}>{task.name}</div>
                    {'project' in task && <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500', marginRight: 10 }}>{(task as typeof companyTasks[number]).project}</div>}
                    {'assignee' in task && <div style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500', marginRight: 10 }}>{(task as typeof companyTasks[number]).assignee}</div>}
                    <span style={{ ...badgeStyle(priorityColors[task.priority].bg, priorityColors[task.priority].text), marginRight: 12 }}>{task.priority}</span>
                    <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13, fontFamily: 'Poppins', fontWeight: '500', minWidth: 45, textAlign: 'right' }}>{task.due}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Projects Panel — full width */}
            <div style={{
              flex: 1,
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              padding: '20px',
            }}>
              <div style={{ color: 'rgba(255, 89, 0, 0.80)', fontSize: 20, fontFamily: 'Poppins', fontWeight: '600', marginBottom: '20px' }}>Manage Projects</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 90px 100px', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Project</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Task</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Assignee</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Due Date</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Status</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {projectRows.map((row, i) => (
                  <div
                    key={i}
                    onClick={() => { window.location.href = '/dashboard/projects'; }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 140px 90px 100px',
                      gap: '10px',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: hoveredRow === i ? '#fafafa' : 'transparent',
                      transition: 'background 150ms ease',
                    }}
                  >
                    <div style={{ color: 'black', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600' }}>{row.project}</div>
                    <div style={{ color: 'black', fontSize: 13, fontFamily: 'Poppins', fontWeight: '500' }}>{row.task}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: row.assigneeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Poppins', fontWeight: 700, color: 'white', flexShrink: 0 }}>{row.assigneeInitials}</div>
                      <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.assignee}</div>
                    </div>
                    <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.due}</div>
                    <div><span style={{ ...badgeStyle(projectStatusColors[row.status].bg, projectStatusColors[row.status].text), padding: '6px 10px' }}>{row.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}