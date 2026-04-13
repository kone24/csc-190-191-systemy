"use client";

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import ReminderBanner from '@/components/dashboard/ReminderBanner';
import { useUser } from '@/contexts/UserContext';

// Copied from projects/page.tsx — maps raw DB project status values to display label + badge colors
const PROJECT_STATUS_MAP: Record<string, { label: string; bg: string; text: string; shadow: string }> = {
  'open':        { label: 'On Track',  bg: '#22C55E', text: 'black', shadow: 'rgba(34, 197, 94, 0.6)'   },
  'in_progress': { label: 'At Risk',   bg: '#F59E0B', text: 'black', shadow: 'rgba(245, 158, 11, 0.6)'  },
  'completed':   { label: 'Completed', bg: '#9CA3AF', text: 'white', shadow: 'rgba(156, 163, 175, 0.6)' },
  'on_hold':     { label: 'On Hold',   bg: '#FF5900', text: 'white', shadow: 'rgba(255, 89, 0, 0.6)'    },
  'cancelled':   { label: 'Cancelled', bg: '#EF4444', text: 'white', shadow: 'rgba(239, 68, 68, 0.6)'   },
  'behind':      { label: 'Behind',    bg: '#EF4444', text: 'white', shadow: 'rgba(239, 68, 68, 0.6)'   },
};
const PROJECT_STATUS_DEFAULT = { label: 'Unknown', bg: '#9CA3AF', text: 'white', shadow: 'rgba(156, 163, 175, 0.6)' };

// Matches the color keys used in the Gantt page
const GANTT_COLORS: Record<string, string> = {
  red: '#fca5a5', teal: '#7dd3fc', purple: '#c4b5fd', green: '#86efac',
  blue: '#93c5fd', yellow: '#fdba74', pink: '#f9a8d4', mint: '#6ee7b7',
  indigo: '#a5b4fc', amber: '#fde68a', lime: '#d9f99d', cyan: '#a5f3fc',
  mauve: '#e9d5ff', blush: '#fecdd3',
};

interface GanttEntryPreview {
  gantt_entry_id: string;
  title: string;
  assignee: string | null;
  color: string;
  start_date: string;
  end_date: string;
}

export default function DashboardPage() {
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredGantt, setHoveredGantt] = useState(false);
  const [sortByDate, setSortByDate] = useState(false);
  const { user } = useUser();
  const isAdminOrManager = user?.role === 'Administrator' || user?.role === 'Manager';
  const [taskView, setTaskView] = useState<'my' | 'company'>('my');
  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null);
  const [activeContactsCount, setActiveContactsCount] = useState<number | null>(null);
  const [ganttEntries, setGanttEntries] = useState<GanttEntryPreview[] | null>(null);

  useEffect(() => {
    if (isAdminOrManager) setTaskView('company');
  }, [isAdminOrManager]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setActiveProjectsCount(Array.isArray(data.items) ? data.items.length : 0))
      .catch(() => setActiveProjectsCount(0));

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setActiveContactsCount(Array.isArray(data.items) ? data.items.length : 0))
      .catch(() => setActiveContactsCount(0));

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gantt-entries`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        console.log('[Gantt preview] raw API response:', data);
        // API returns { items: [...] } — same shape as /projects and /clients
        setGanttEntries(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
      })
      .catch(() => setGanttEntries([]));
  }, []);

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

  const projectRows = [
    { project: 'Website Rebrand', task: 'Design Sprint', assignee: 'Jez K.',    assigneeInitials: 'JK', assigneeBg: '#f97316', due: 'Dec 31', status: 'open'        },
    { project: 'Q1 Campaign',     task: 'Research',      assignee: 'Rachel S.', assigneeInitials: 'RS', assigneeBg: '#8979FF', due: 'Jan 10', status: 'on_hold'     },
    { project: 'App Launch',      task: 'Build',         assignee: 'Matthew T.',assigneeInitials: 'MT', assigneeBg: '#00C980', due: 'Jan 20', status: 'in_progress' },
    { project: 'Brand Refresh',   task: 'Strategy',      assignee: 'Ashley S.', assigneeInitials: 'AS', assigneeBg: '#537FF1', due: 'Feb 5',  status: 'behind'      },
    { project: 'Case Study',      task: 'Copywriting',   assignee: 'Xavier M.', assigneeInitials: 'XM', assigneeBg: '#FF928A', due: 'Mar 1',  status: 'open'        },
    { project: 'App Launch',      task: 'QA Testing',    assignee: 'Rachel S.', assigneeInitials: 'RS', assigneeBg: '#8979FF', due: 'Mar 15', status: 'completed'   },
  ];
  const [liveProjectRows, setLiveProjectRows] = useState<typeof projectRows | null>(null);

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

  const ganttWeekHeaders = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const mon1 = new Date(today);
    mon1.setDate(today.getDate() - ((day + 6) % 7));
    mon1.setHours(0, 0, 0, 0);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmt = (d: Date) => `${months[d.getMonth()]} ${d.getDate()}`;
    const fri1 = new Date(mon1); fri1.setDate(mon1.getDate() + 4);
    const mon2 = new Date(mon1); mon2.setDate(mon1.getDate() + 7);
    const fri2 = new Date(mon1); fri2.setDate(mon1.getDate() + 11);
    return [
      `Mon ${fmt(mon1)} — Fri ${fmt(fri1)}`,
      `Mon ${fmt(mon2)} — Fri ${fmt(fri2)}`,
    ];
  }, []);

  const avatarPalette = ['#f97316', '#8979FF', '#00C980', '#537FF1', '#FF928A', '#FFAC80'];

  const liveGanttRows = useMemo(() => {
    if (ganttEntries === null) return null;

    // Use local date components to avoid UTC offset shifting the date
    const toIso = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    // Parse "YYYY-MM-DD" as local midnight (new Date("YYYY-MM-DD") parses as UTC which is wrong)
    const parseLocalDate = (iso: string) => {
      const [y, mo, d] = iso.split('-').map(Number);
      return new Date(y, mo - 1, d).getTime();
    };
    // Count Mon–Fri days between startMs and endMs inclusive
    const countWorkdays = (startMs: number, endMs: number): number => {
      let count = 0;
      for (let d = startMs; d <= endMs; d += 86400000) {
        const dow = new Date(d).getDay();
        if (dow !== 0 && dow !== 6) count++;
      }
      return count;
    };

    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const currentMonday = toIso(monday);
    const nextFriday = new Date(monday); nextFriday.setDate(monday.getDate() + 11);
    const nextFridayIso = toIso(nextFriday);
    const mondayMs = monday.getTime();
    const nextFridayMs = parseLocalDate(nextFridayIso);

    console.log('[Gantt preview] ganttEntries count:', ganttEntries.length, '| ganttEntries:', ganttEntries);
    console.log('[Gantt preview] currentMonday:', currentMonday, '| nextFriday:', nextFridayIso);

    // Normalize dates to YYYY-MM-DD (slice off any time component like "T00:00:00.000Z")
    const twoWeekEntries = ganttEntries.filter(e => {
      const sd = e.start_date.slice(0, 10);
      const ed = e.end_date.slice(0, 10);
      const pass = sd <= nextFridayIso && ed >= currentMonday;
      console.log('[Gantt preview]  entry:', e.title, '| start:', sd, '| end:', ed, '| pass:', pass);
      return pass;
    });
    if (twoWeekEntries.length === 0) return [];

    const byAssignee = new Map<string, GanttEntryPreview[]>();
    twoWeekEntries.forEach(e => {
      const key = e.assignee ?? 'Unassigned';
      if (!byAssignee.has(key)) byAssignee.set(key, []);
      byAssignee.get(key)!.push(e);
    });

    return Array.from(byAssignee.entries()).map(([assignee, entries], idx) => {
      const parts = assignee.trim().split(/\s+/);
      const initials = assignee === 'Unassigned' ? '?'
        : (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2)).toUpperCase();
      const bg = avatarPalette[idx % avatarPalette.length];
      const bars = entries.map(e => {
        const sd = e.start_date.slice(0, 10);
        const ed = e.end_date.slice(0, 10);
        // Clamp to window using ms — more explicit than string comparison
        const overlapStartMs = Math.max(parseLocalDate(sd), mondayMs);
        // end_date is stored as the Monday of the end week — add 4 days to get that Friday
        const overlapEndMs   = Math.min(parseLocalDate(ed) + 4 * 86400000, nextFridayMs);
        // Count Mon–Fri days the entry overlaps with the 10-day window
        const overlapDays = overlapStartMs <= overlapEndMs ? countWorkdays(overlapStartMs, overlapEndMs) : 0;
        // Width as a percentage of the 10-day window, clamped 0–100
        const widthPct = Math.min(overlapDays / 10 * 100, 100);
        // Left offset: working days from window start to the day before this bar
        const startWd = overlapStartMs <= mondayMs ? 0 : countWorkdays(mondayMs, overlapStartMs - 86400000);
        const color = GANTT_COLORS[e.color] ?? '#d1d5db';
        return { label: e.title, startWd, widthPct, color };
      });
      return { name: assignee, initials, avatarBg: bg, bars };
    });
  }, [ganttEntries]);

  const ganttRows = [
    { name: 'Jez K.', initials: 'JK', avatarBg: '#f97316', bars: [{ label: 'Website Rebrand', startWd: 0, widthPct: 80, color: '#FFAC80' }] },
    { name: 'Rachel S.', initials: 'RS', avatarBg: '#8979FF', bars: [{ label: 'OOO', startWd: 2, widthPct: 30, color: '#d1d5db' }, { label: 'Q1 Campaign', startWd: 5, widthPct: 50, color: 'rgba(91, 66, 255, 0.4)' }] },
    { name: 'Matthew T.', initials: 'MT', avatarBg: '#00C980', bars: [{ label: 'App Launch', startWd: 0, widthPct: 100, color: '#00F5A0' }] },
    { name: 'Ashley S.', initials: 'AS', avatarBg: '#537FF1', bars: [{ label: 'Brand Refresh', startWd: 1, widthPct: 80, color: '#FFAC80' }] },
    { name: 'Xavier M.', initials: 'XM', avatarBg: '#FF928A', bars: [{ label: 'OOO', startWd: 0, widthPct: 20, color: '#d1d5db' }, { label: 'Case Study', startWd: 3, widthPct: 70, color: 'rgba(255, 246, 66, 0.6)' }] },
  ];

  const displayGanttRows = (liveGanttRows ?? ganttRows).slice(0, 6);

  const formatProjectDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const getOwnerInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2)).toUpperCase();
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data.items) || data.items.length === 0) {
          setLiveProjectRows(projectRows);
          return;
        }
        const sorted = [...data.items].sort((a, b) => {
          const da = a.start_date ? new Date(a.start_date).getTime() : 0;
          const db = b.start_date ? new Date(b.start_date).getTime() : 0;
          return db - da;
        });
        const rows = sorted.slice(0, 4).map((p, i) => ({
          project: p.name ?? '—',
          task: '',
          assignee: p.owner_name ?? (p.owner_id ? String(p.owner_id) : '—'),
          assigneeInitials: getOwnerInitials(p.owner_name ?? null),
          assigneeBg: avatarPalette[i % avatarPalette.length],
          due: formatProjectDate(p.end_date ?? null),
          status: p.status ?? 'On Track',
        }));
        setLiveProjectRows(rows);
      })
      .catch(() => setLiveProjectRows(projectRows));
  }, []);

  const displayProjectRows = liveProjectRows ?? projectRows;

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

        </div>

        <ReminderBanner />

        {/* Top Section - Stats Cards and Manage Projects */}
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
              <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>{activeProjectsCount === null ? '...' : activeProjectsCount}</div>
            </div>
          </div>

          {isAdminOrManager ? (
            <>
              {/* Active Contacts */}
              <div style={tileStyle(1, kpiColors.activeContacts.border, kpiColors.activeContacts.shadow)} onMouseEnter={() => setHoveredTile(1)} onMouseLeave={() => setHoveredTile(null)}>
                <div style={{ ...tileTopZone, background: '#00F5A0', borderBottom: '1px solid #00C980' }}><span style={{ ...tileLabelStyle, color: '#065f46' }}>Active Contacts</span></div>
                <div style={tileBodyZone}>
                  <div style={{ textAlign: 'center', color: 'black', fontSize: 48, fontFamily: 'Poppins', fontWeight: '700', lineHeight: 1 }}>{activeContactsCount === null ? '...' : activeContactsCount}</div>
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
          <div style={{ height: 390, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Upcoming Tasks Section */}
            <div style={{
              background: 'white',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 20,
              padding: '20px',
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
                {displayTasks.slice(0, 6).map((task, i) => (
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 90px 100px', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Project</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Owner</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Due Date</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Status</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {liveProjectRows === null
                  ? <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.35)', fontSize: 14, fontFamily: 'Poppins', padding: '20px 0' }}>...</div>
                  : displayProjectRows.map((row, i) => {
                    const s = PROJECT_STATUS_MAP[row.status] ?? PROJECT_STATUS_DEFAULT;
                    return (
                      <div
                        key={i}
                        onClick={() => { window.location.href = '/dashboard/projects'; }}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 140px 90px 100px',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: row.assigneeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Poppins', fontWeight: 700, color: 'white', flexShrink: 0 }}>{row.assigneeInitials}</div>
                          <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.assignee}</div>
                        </div>
                        <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.due}</div>
                        <div><span style={{ ...badgeStyle(s.bg, s.text), padding: '6px 10px' }}>{s.label}</span></div>
                      </div>
                    );
                  })
                }
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
              minHeight: 380,
              marginTop: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ color: 'rgba(255, 89, 0, 0.80)', fontSize: 20, fontFamily: 'Poppins', fontWeight: '600' }}>Gantt</div>
              <span style={{ color: '#f97316', fontSize: 13, fontFamily: 'Poppins', fontWeight: 600 }}>View full Gantt →</span>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 0 }}>
              <div />
              {ganttWeekHeaders.map((h, i) => (
                <div key={i} style={{
                  textAlign: 'center', fontSize: 11, fontFamily: 'Poppins', fontWeight: 600,
                  color: 'rgba(0,0,0,0.5)', paddingBottom: 8,
                  borderBottom: '1px solid #e8e8e8',
                  borderLeft: i === 1 ? '1px solid #e8e8e8' : 'none',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Gantt rows */}
            {ganttEntries === null ? (
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.35)', fontSize: 14, fontFamily: 'Poppins', padding: '20px 0' }}>...</div>
            ) : displayGanttRows.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.35)', fontSize: 13, fontFamily: 'Poppins', padding: '20px 0' }}>No entries this week</div>
            ) : displayGanttRows.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', borderBottom: ri < displayGanttRows.length - 1 ? '1px solid #f0f0f0' : 'none', padding: '10px 0' }}>
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
                  {/* Week divider at 50% */}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '1px solid #e8e8e8' }} />
                  {/* Bars */}
                  {row.bars.map((bar, bi) => (
                    <div key={bi} style={{
                      position: 'absolute',
                      top: 4, bottom: 4,
                      left: `${(bar.startWd / 10) * 100}%`,
                      width: `${bar.widthPct}%`,
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 90px 100px', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Project</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Owner</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Due Date</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600' }}>Status</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {liveProjectRows === null
                  ? <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.35)', fontSize: 14, fontFamily: 'Poppins', padding: '20px 0' }}>...</div>
                  : displayProjectRows.slice(0, 5).map((row, i) => {
                    const s = PROJECT_STATUS_MAP[row.status] ?? PROJECT_STATUS_DEFAULT;
                    return (
                      <div
                        key={i}
                        onClick={() => { window.location.href = '/dashboard/projects'; }}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 140px 90px 100px',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: row.assigneeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Poppins', fontWeight: 700, color: 'white', flexShrink: 0 }}>{row.assigneeInitials}</div>
                          <div style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.assignee}</div>
                        </div>
                        <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500' }}>{row.due}</div>
                        <div><span style={{ ...badgeStyle(s.bg, s.text), padding: '6px 10px' }}>{s.label}</span></div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}