'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';

// ── Color palette ───────────────────────────────────────────────────────────
const COLORS: Record<string, { bg: string; text: string }> = {
    red:    { bg: '#ef4444', text: '#fff' },
    teal:   { bg: '#14b8a6', text: '#fff' },
    purple: { bg: '#a855f7', text: '#fff' },
    green:  { bg: '#22c55e', text: '#fff' },
    blue:   { bg: '#3b82f6', text: '#fff' },
    yellow: { bg: '#eab308', text: '#000' },
    pink:   { bg: '#ec4899', text: '#fff' },
};

const COLOR_KEYS = ['red', 'teal', 'purple', 'green', 'blue', 'yellow', 'pink'] as const;

// ── Layout constants ────────────────────────────────────────────────────────
const WEEK_COUNT = 8;
const LEFT_COL_WIDTH = 280;
const NAV_BTN_WIDTH = 28;
const LANE_HEIGHT = 32;
const LANE_GAP = 4;
const BAR_HEIGHT = 28;
const BAR_H_PAD = 4;
const HEADER_HEIGHT = 44;
const CLIENT_ROW_HEIGHT = 40;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function projectRowHeight(laneCount: number): number {
    const n = Math.max(laneCount, 1);
    // +1 extra lane at the bottom for the "add new" row
    const total = n + 1;
    return total * LANE_HEIGHT + (total - 1) * LANE_GAP + 8;
}

// ── Date helpers ────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string into a Date at midnight local time. */
function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/** Format a Date as YYYY-MM-DD. */
function toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Get the Monday of the week containing `date`. */
function toMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun … 6=Sat
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getCurrentMonday(): Date {
    return toMonday(new Date());
}

/** Add `weeks` weeks to a date. */
function addWeeks(date: Date, weeks: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
}

/** Number of whole weeks from Monday `a` to Monday `b` (can be negative). */
function weeksBetween(a: Date, b: Date): number {
    return Math.round((b.getTime() - a.getTime()) / MS_PER_WEEK);
}

function formatWeekHeader(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Mon ${months[date.getMonth()]} ${date.getDate()}`;
}

// ── Data types ──────────────────────────────────────────────────────────────
interface LaneEntry {
    text: string;
    color: string;
    /** Monday of the start week, ISO string YYYY-MM-DD */
    startDate: string;
    /** Monday of the end week, ISO string YYYY-MM-DD */
    endDate: string;
}

interface ProjectRow {
    name: string;
    lanes: LaneEntry[][];
}

interface ClientGroup {
    client: string;
    projects: ProjectRow[];
}

// ── Popover target ──────────────────────────────────────────────────────────
interface PopoverTarget {
    x: number;
    y: number;
    clientIdx: number;
    projectIdx: number;
    laneIdx?: number;
    entryIdx?: number;
    /** ISO date string of clicked week (for new entries) */
    clickedWeek?: string;
}

// ── Overlap helpers ─────────────────────────────────────────────────────────
function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
    return !(aEnd < bStart || aStart > bEnd); // ISO strings compare lexicographically
}

function findAvailableLane(
    project: ProjectRow,
    start: string,
    end: string,
    excludeLane?: number,
    excludeEntry?: number,
): number {
    for (let li = 0; li < project.lanes.length; li++) {
        const hasOverlap = project.lanes[li].some((e, ei) => {
            if (li === excludeLane && ei === excludeEntry) return false;
            return datesOverlap(start, end, e.startDate, e.endDate);
        });
        if (!hasOverlap) return li;
    }
    return project.lanes.length;
}

// ── Build initial data from current Monday ──────────────────────────────────
function buildInitialData(): ClientGroup[] {
    const epoch = getCurrentMonday();
    const w = (offset: number) => toIso(addWeeks(epoch, offset));

    return [
        {
            client: 'ANGEL',
            projects: [
                {
                    name: 'Quokka',
                    lanes: [
                        [{ text: 'Influencer Campaign - Jez', color: 'red', startDate: w(0), endDate: w(0) }],
                        [{ text: 'Cutting Clip -', color: 'teal', startDate: w(0), endDate: w(0) }],
                    ],
                },
                {
                    name: 'Homestead',
                    lanes: [
                        [
                            { text: 'Digesting - Jez', color: 'red', startDate: w(1), endDate: w(1) },
                            { text: 'Research for U+P - Anya', color: 'red', startDate: w(2), endDate: w(3) },
                        ],
                        [
                            { text: 'Digestinng - Anya', color: 'pink', startDate: w(1), endDate: w(1) },
                            { text: 'Research for U+P - Anya', color: 'pink', startDate: w(2), endDate: w(3) },
                        ],
                        [
                            { text: 'Digesting - Ashley', color: 'green', startDate: w(1), endDate: w(1) },
                            { text: 'Research for U+ P - Ashley', color: 'green', startDate: w(2), endDate: w(3) },
                        ],
                    ],
                },
            ],
        },
        {
            client: 'WINGFEATHER',
            projects: [
                {
                    name: 'Wingfeather Saga',
                    lanes: [
                        [{ text: 'Meta Promotions 6 - Trevor / Matthew', color: 'blue', startDate: w(0), endDate: w(1) }],
                        [{ text: 'Motion Comics - Trevor', color: 'yellow', startDate: w(0), endDate: w(7) }],
                        [{ text: 'Tik Tok / Carousels - Candy', color: 'yellow', startDate: w(0), endDate: w(7) }],
                    ],
                },
            ],
        },
    ];
}

const LEGEND_ITEMS = [
    { color: 'red', label: 'Red' },
    { color: 'teal', label: 'Teal' },
    { color: 'purple', label: 'Purple' },
    { color: 'green', label: 'Green' },
    { color: 'blue', label: 'Blue' },
    { color: 'yellow', label: 'Yellow' },
    { color: 'pink', label: 'Pink' },
];

// ── Resize handle CSS (injected once) ───────────────────────────────────────
const RESIZE_CSS = `
.gantt-bar .react-resizable-handle {
    width: 6px !important;
    height: 100% !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    padding: 0 !important;
    cursor: ew-resize !important;
    background: rgba(0,0,0,0.2) !important;
    border-radius: 0 4px 4px 0 !important;
    position: absolute !important;
    opacity: 0;
    transition: opacity 0.15s;
}
.gantt-bar .react-resizable-handle::after { display: none !important; }
.gantt-bar:hover .react-resizable-handle { opacity: 1; }
.gantt-cell { transition: background 0.12s; }
.gantt-cell:hover { background: rgba(249, 115, 22, 0.08) !important; }
`;

// ── Component ───────────────────────────────────────────────────────────────
export default function GanttPage() {
    const [windowStart, setWindowStart] = useState(() => getCurrentMonday());

    // ── Dynamic column width ─────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setContainerWidth(entry.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const colWidth = useMemo(() => {
        if (containerWidth === 0) return 150;
        return Math.max((containerWidth - LEFT_COL_WIDTH - NAV_BTN_WIDTH * 2) / WEEK_COUNT, 1);
    }, [containerWidth]);

    const visibleWeekDates = useMemo(
        () => Array.from({ length: WEEK_COUNT }, (_, i) => addWeeks(windowStart, i)),
        [windowStart],
    );

    const windowEndIso = useMemo(() => toIso(addWeeks(windowStart, WEEK_COUNT - 1)), [windowStart]);
    const windowStartIso = useMemo(() => toIso(windowStart), [windowStart]);

    // Index of the current week column within the visible window (-1 if not visible)
    const currentWeekCol = useMemo(() => {
        const cwIso = toIso(getCurrentMonday());
        return visibleWeekDates.findIndex(d => toIso(d) === cwIso);
    }, [visibleWeekDates]);

    const [data, setData] = useState<ClientGroup[]>(() => buildInitialData());

    // Popover state
    const [popover, setPopover] = useState<PopoverTarget | null>(null);
    const [formText, setFormText] = useState('');
    const [formColor, setFormColor] = useState('red');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [saveHover, setSaveHover] = useState(false);
    const [deleteHover, setDeleteHover] = useState(false);

    const resizedRef = useRef(false);

    const isEditing = popover !== null && popover.laneIdx !== undefined && popover.entryIdx !== undefined;

    // ── Week navigation ─────────────────────────────────────────────────
    const goPrev = useCallback(() => setWindowStart(ws => addWeeks(ws, -1)), []);
    const goNext = useCallback(() => setWindowStart(ws => addWeeks(ws, 1)), []);

    // ── Dropdown weeks (visible window ± 12 weeks) ──────────────────────
    const dropdownWeeks = useMemo(() => {
        const rangeStart = -12;
        const rangeEnd = WEEK_COUNT + 12;
        return Array.from({ length: rangeEnd - rangeStart }, (_, i) => {
            const d = addWeeks(windowStart, rangeStart + i);
            return { iso: toIso(d), date: d };
        });
    }, [windowStart]);

    // ── Open popover on empty area click ────────────────────────────────
    const handleEmptyCellClick = useCallback((
        e: React.MouseEvent,
        clientIdx: number,
        projectIdx: number,
        clickX: number,
        clickY: number,
        weekIso: string,
    ) => {
        e.stopPropagation();
        setPopover({ x: clickX, y: clickY + 4, clientIdx, projectIdx, clickedWeek: weekIso });
        setFormText('');
        setFormColor('red');
        setFormStartDate(weekIso);
        setFormEndDate(weekIso);
        setSaveHover(false);
        setDeleteHover(false);
    }, []);

    // ── Open popover on existing entry click ────────────────────────────
    const handleEntryClick = useCallback((
        e: React.MouseEvent,
        clientIdx: number,
        projectIdx: number,
        laneIdx: number,
        entryIdx: number,
        entry: LaneEntry,
    ) => {
        e.stopPropagation();
        if (resizedRef.current) {
            resizedRef.current = false;
            return;
        }
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPopover({ x: rect.left, y: rect.bottom + 4, clientIdx, projectIdx, laneIdx, entryIdx });
        setFormText(entry.text);
        setFormColor(entry.color);
        setFormStartDate(entry.startDate);
        setFormEndDate(entry.endDate);
        setSaveHover(false);
        setDeleteHover(false);
    }, []);

    const closePopover = useCallback(() => setPopover(null), []);

    // ── Save handler ────────────────────────────────────────────────────
    const handleSave = useCallback(() => {
        if (!popover || !formText.trim()) return;
        const start = formStartDate <= formEndDate ? formStartDate : formEndDate;
        const end = formStartDate <= formEndDate ? formEndDate : formStartDate;

        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
            const project = next[popover.clientIdx].projects[popover.projectIdx];

            if (popover.laneIdx !== undefined && popover.entryIdx !== undefined) {
                const entry = project.lanes[popover.laneIdx][popover.entryIdx];
                entry.text = formText.trim();
                entry.color = formColor;
                entry.startDate = start;
                entry.endDate = end;

                const stillFits = !project.lanes[popover.laneIdx].some((e, ei) => {
                    if (ei === popover.entryIdx) return false;
                    return datesOverlap(start, end, e.startDate, e.endDate);
                });

                if (!stillFits) {
                    project.lanes[popover.laneIdx].splice(popover.entryIdx, 1);
                    const newLane = findAvailableLane(project, start, end);
                    const movedEntry: LaneEntry = {
                        text: formText.trim(), color: formColor,
                        startDate: start, endDate: end,
                    };
                    if (newLane < project.lanes.length) {
                        project.lanes[newLane].push(movedEntry);
                        project.lanes[newLane].sort((a, b) => a.startDate.localeCompare(b.startDate));
                    } else {
                        project.lanes.push([movedEntry]);
                    }
                    project.lanes = project.lanes.filter(l => l.length > 0);
                    if (project.lanes.length === 0) project.lanes.push([]);
                }
            } else {
                const targetLane = findAvailableLane(project, start, end);
                const newEntry: LaneEntry = {
                    text: formText.trim(),
                    color: formColor,
                    startDate: start,
                    endDate: end,
                };
                if (targetLane < project.lanes.length) {
                    project.lanes[targetLane].push(newEntry);
                    project.lanes[targetLane].sort((a, b) => a.startDate.localeCompare(b.startDate));
                } else {
                    project.lanes.push([newEntry]);
                }
            }
            return next;
        });
        setPopover(null);
    }, [popover, formText, formColor, formStartDate, formEndDate]);

    // ── Delete handler ──────────────────────────────────────────────────
    const handleDelete = useCallback(() => {
        if (!popover || popover.laneIdx === undefined || popover.entryIdx === undefined) return;
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
            const project = next[popover.clientIdx].projects[popover.projectIdx];
            project.lanes[popover.laneIdx!].splice(popover.entryIdx!, 1);
            project.lanes = project.lanes.filter(l => l.length > 0);
            if (project.lanes.length === 0) project.lanes.push([]);
            return next;
        });
        setPopover(null);
    }, [popover]);

    // ── Resize stop handler ─────────────────────────────────────────────
    const handleResizeStop = useCallback((
        clientIdx: number,
        projectIdx: number,
        laneIdx: number,
        entryIdx: number,
        newFullWidthPx: number,
        entryStartDate: string,
    ) => {
        resizedRef.current = true;
        const spanCols = Math.max(1, Math.round(newFullWidthPx / colWidth));
        const startD = parseDate(entryStartDate);
        const newEndDate = toIso(addWeeks(startD, spanCols - 1));

        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
            next[clientIdx].projects[projectIdx].lanes[laneIdx][entryIdx].endDate = newEndDate;
            return next;
        });
    }, [colWidth]);

    // ── Popover position clamped to viewport ────────────────────────────
    const popoverLeft = popover
        ? Math.min(popover.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300)
        : 0;
    const popoverTop = popover
        ? Math.min(popover.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 480)
        : 0;

    const selectStyle: React.CSSProperties = {
        padding: '10px 14px',
        borderRadius: 12,
        border: '1px solid #ddd',
        fontSize: 14,
        fontFamily: 'Poppins',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        background: 'white',
        cursor: 'pointer',
        color: '#333',
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Inject resize handle CSS */}
            <style dangerouslySetInnerHTML={{ __html: RESIZE_CSS }} />

            <DevRoleSwitcher />
            <Sidebar activePage="gantt" />

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: 20,
                overflow: 'hidden',
            }}>
                {/* Top bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SearchBar placeholder="Search projects..." onSearch={() => {}} />
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: 'rgba(0,0,0,0.3)',
                            }} />
                        ))}
                    </div>
                </div>

                {/* Page title */}
                <h1 style={{
                    fontFamily: 'Poppins', fontWeight: 600, fontSize: 28,
                    color: '#1a1a1a', margin: 0,
                }}>
                    Gantt Chart
                </h1>

                {/* Color legend */}
                <div style={{
                    display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
                    background: 'white', borderRadius: 12, padding: '10px 20px',
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
                }}>
                    <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: '#555' }}>
                        Legend:
                    </span>
                    {LEGEND_ITEMS.map(item => (
                        <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 14, height: 14, borderRadius: 3,
                                background: COLORS[item.color].bg,
                            }} />
                            <span style={{ fontFamily: 'Poppins', fontSize: 12, color: '#555' }}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Gantt grid ─────────────────────────────────────────────── */}
                <div
                    ref={containerRef}
                    style={{
                        flex: 1, overflowX: 'hidden', overflowY: 'auto', borderRadius: 12,
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.10)',
                        background: 'white', width: '100%',
                    }}
                >
                    <div style={{ width: '100%', fontFamily: 'Poppins' }}>

                        {/* Header row */}
                        <div style={{
                            display: 'flex',
                            position: 'sticky', top: 0, zIndex: 3,
                        }}>
                            <div style={{
                                width: LEFT_COL_WIDTH, flexShrink: 0,
                                height: HEADER_HEIGHT,
                                background: '#FF5900', color: 'white',
                                fontWeight: 600, fontSize: 14,
                                padding: '0 16px',
                                display: 'flex', alignItems: 'center',
                                position: 'sticky', left: 0, zIndex: 4,
                                borderBottom: '2px solid #e0e0e0',
                                boxSizing: 'border-box',
                            }}>
                                Client / Project
                            </div>

                            <button
                                onClick={goPrev}
                                title="Previous week"
                                style={{
                                    width: NAV_BTN_WIDTH, flexShrink: 0,
                                    height: HEADER_HEIGHT,
                                    background: '#FF5900', color: 'white',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 700, fontFamily: 'Poppins',
                                    borderBottom: '2px solid #e0e0e0',
                                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                                    boxSizing: 'border-box',
                                    padding: 0,
                                }}
                            >
                                &#8249;
                            </button>

                            {visibleWeekDates.map((w, i) => {
                                const isCurrent = i === currentWeekCol;
                                return (
                                    <div key={i} style={{
                                        flex: 1, minWidth: 0,
                                        height: HEADER_HEIGHT,
                                        background: isCurrent ? '#e04e00' : '#FF5900',
                                        color: 'white',
                                        fontWeight: isCurrent ? 700 : 500,
                                        fontSize: 12,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderBottom: '2px solid #e0e0e0',
                                        borderTop: isCurrent ? '3px solid #fff' : 'none',
                                        borderLeft: '1px solid rgba(255,255,255,0.3)',
                                        whiteSpace: 'nowrap',
                                        boxSizing: 'border-box',
                                    }}>
                                        {formatWeekHeader(w)}
                                    </div>
                                );
                            })}

                            <button
                                onClick={goNext}
                                title="Next week"
                                style={{
                                    width: NAV_BTN_WIDTH, flexShrink: 0,
                                    height: HEADER_HEIGHT,
                                    background: '#FF5900', color: 'white',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 700, fontFamily: 'Poppins',
                                    borderBottom: '2px solid #e0e0e0',
                                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                                    boxSizing: 'border-box',
                                    padding: 0,
                                }}
                            >
                                &#8250;
                            </button>

                        </div>

                        {/* Body rows */}
                        {data.map((group, clientIdx) => (
                            <React.Fragment key={`client-${group.client}`}>
                                <div style={{
                                    width: '100%',
                                    height: CLIENT_ROW_HEIGHT,
                                    background: '#1f2937', color: 'white',
                                    fontWeight: 700, fontSize: 14,
                                    padding: '0 16px', letterSpacing: 1,
                                    display: 'flex', alignItems: 'center',
                                    position: 'sticky', left: 0, zIndex: 2,
                                    borderLeft: '3px solid #f97316',
                                }}>
                                    {group.client}
                                </div>

                                {group.projects.map((project, projectIdx) => {
                                    const laneCount = Math.max(project.lanes.length, 1);
                                    const rowH = projectRowHeight(laneCount);

                                    return (
                                        <div
                                            key={`${group.client}-${project.name}`}
                                            style={{
                                                display: 'flex',
                                                borderBottom: '1px solid #000',
                                            }}
                                        >
                                            <div style={{
                                                width: LEFT_COL_WIDTH, flexShrink: 0,
                                                height: rowH,
                                                background: '#f5f5f5',
                                                padding: '10px 16px 4px 32px',
                                                fontWeight: 500, fontSize: 13, color: '#333',
                                                display: 'flex', alignItems: 'flex-start',
                                                position: 'sticky', left: 0, zIndex: 2,
                                                borderRight: '1px solid #e8e8e8',
                                                boxSizing: 'border-box',
                                            }}>
                                                {project.name}
                                            </div>

                                            <div style={{ width: NAV_BTN_WIDTH, flexShrink: 0, height: rowH, background: '#f5f5f5' }} />

                                            <div
                                                style={{
                                                    position: 'relative',
                                                    flex: 1,
                                                    minWidth: 0,
                                                    height: rowH,
                                                    background: '#fafafa',
                                                    overflow: 'hidden',
                                                }}
                                                onClick={(e) => {
                                                    if (e.target !== e.currentTarget) return;
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const relX = e.clientX - rect.left;
                                                    const colIdx = Math.min(Math.max(Math.floor(relX / colWidth), 0), WEEK_COUNT - 1);
                                                    const weekIso = toIso(addWeeks(windowStart, colIdx));
                                                    handleEmptyCellClick(e, clientIdx, projectIdx, e.clientX, e.clientY, weekIso);
                                                }}
                                            >
                                                {/* Column gridlines (borders + current-week tint, non-interactive) */}
                                                {Array.from({ length: WEEK_COUNT }).map((_, wi) => (
                                                    <div
                                                        key={`gridline-${wi}`}
                                                        style={{
                                                            position: 'absolute',
                                                            left: wi * colWidth,
                                                            top: 0,
                                                            width: colWidth,
                                                            height: rowH,
                                                            borderLeft: wi > 0 ? '1px solid #ececec' : 'none',
                                                            background: wi === currentWeekCol ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                                                            boxSizing: 'border-box',
                                                            pointerEvents: 'none',
                                                        }}
                                                    />
                                                ))}

                                                {/* Per-lane per-column hover cells (including the extra add-new lane) */}
                                                {Array.from({ length: laneCount + 1 }).map((_, li) =>
                                                    Array.from({ length: WEEK_COUNT }).map((_, wi) => (
                                                        <div
                                                            key={`cell-${li}-${wi}`}
                                                            className="gantt-cell"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const weekIso = toIso(addWeeks(windowStart, wi));
                                                                handleEmptyCellClick(e, clientIdx, projectIdx, e.clientX, e.clientY, weekIso);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                left: wi * colWidth,
                                                                top: 4 + li * (LANE_HEIGHT + LANE_GAP),
                                                                width: colWidth,
                                                                height: LANE_HEIGHT,
                                                                cursor: 'pointer',
                                                                boxSizing: 'border-box',
                                                                borderRadius: 4,
                                                            }}
                                                        />
                                                    )),
                                                )}

                                                {/* Entry bars */}
                                                {project.lanes.map((lane, laneIdx) =>
                                                    lane.map((entry, entryIdx) => {
                                                        if (entry.endDate < windowStartIso || entry.startDate > windowEndIso) return null;

                                                        const entryStart = parseDate(entry.startDate);
                                                        const entryEnd = parseDate(entry.endDate);
                                                        const c = COLORS[entry.color] || COLORS.red;

                                                        const rawStartCol = weeksBetween(windowStart, entryStart);
                                                        const rawEndCol = weeksBetween(windowStart, entryEnd);

                                                        // Clamp to visible window
                                                        const startCol = Math.max(rawStartCol, 0);
                                                        const endCol = Math.min(rawEndCol, WEEK_COUNT - 1);

                                                        const barLeft = startCol * colWidth + BAR_H_PAD;
                                                        const barWidth = (endCol - startCol + 1) * colWidth - BAR_H_PAD * 2;
                                                        const barTop = 4 + laneIdx * (LANE_HEIGHT + LANE_GAP);

                                                        const maxWidth = 52 * colWidth;

                                                        return (
                                                            <div
                                                                key={`bar-${laneIdx}-${entryIdx}`}
                                                                className="gantt-bar"
                                                                style={{
                                                                    position: 'absolute',
                                                                    left: barLeft,
                                                                    top: barTop,
                                                                    zIndex: 1,
                                                                }}
                                                            >
                                                                <ResizableBox
                                                                    width={barWidth}
                                                                    height={BAR_HEIGHT}
                                                                    axis="x"
                                                                    minConstraints={[colWidth - BAR_H_PAD * 2, BAR_HEIGHT]}
                                                                    maxConstraints={[maxWidth, BAR_HEIGHT]}
                                                                    resizeHandles={['e']}
                                                                    onResizeStop={(_e, { size }) => {
                                                                        const newFullWidth = size.width + BAR_H_PAD * 2;
                                                                        handleResizeStop(
                                                                            clientIdx, projectIdx,
                                                                            laneIdx, entryIdx,
                                                                            newFullWidth,
                                                                            entry.startDate,
                                                                        );
                                                                    }}
                                                                >
                                                                    <div
                                                                        title={entry.text}
                                                                        onClick={(e) => handleEntryClick(
                                                                            e, clientIdx, projectIdx,
                                                                            laneIdx, entryIdx, entry,
                                                                        )}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: BAR_HEIGHT,
                                                                            borderRadius: 4,
                                                                            background: c.bg,
                                                                            color: c.text,
                                                                            fontSize: 11,
                                                                            fontWeight: 500,
                                                                            lineHeight: `${BAR_HEIGHT}px`,
                                                                            paddingLeft: 8,
                                                                            paddingRight: 14,
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            cursor: 'pointer',
                                                                            boxSizing: 'border-box',
                                                                        }}
                                                                    >
                                                                        {entry.text}
                                                                    </div>
                                                                </ResizableBox>
                                                            </div>
                                                        );
                                                    }),
                                                )}

                                            </div>

                                            <div style={{ width: NAV_BTN_WIDTH, flexShrink: 0, height: rowH, background: '#f5f5f5' }} />
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Popover ─────────────────────────────────────────────────────── */}
            {popover && (
                <div
                    onClick={closePopover}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0, 0, 0, 0.18)',
                        zIndex: 999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            left: popoverLeft,
                            top: popoverTop,
                            zIndex: 1000,
                            background: 'white',
                            borderRadius: 8,
                            width: 280,
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{
                            height: 4,
                            background: COLORS[formColor]?.bg || '#FF5900',
                        }} />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 16px 0 16px',
                        }}>
                            <h3 style={{
                                fontSize: 16, fontWeight: 700,
                                fontFamily: 'Poppins', color: 'black', margin: 0,
                            }}>
                                {isEditing ? 'Edit Entry' : 'New Entry'}
                            </h3>
                            <button
                                onClick={closePopover}
                                style={{
                                    background: 'none', border: 'none',
                                    fontSize: 20, cursor: 'pointer',
                                    color: '#999', padding: '0 4px',
                                    lineHeight: 1, fontFamily: 'Poppins',
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{
                            padding: '14px 16px 16px 16px',
                            display: 'flex', flexDirection: 'column', gap: 14,
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{
                                    fontSize: 12, color: '#888',
                                    fontFamily: 'Poppins', fontWeight: 500,
                                }}>
                                    Content
                                </label>
                                <input
                                    type="text"
                                    value={formText}
                                    onChange={(e) => setFormText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                                    autoFocus
                                    placeholder="Enter content..."
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 12,
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        outline: 'none',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{
                                    fontSize: 12, color: '#888',
                                    fontFamily: 'Poppins', fontWeight: 500,
                                }}>
                                    Color
                                </label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {COLOR_KEYS.map((ck) => {
                                        const selected = formColor === ck;
                                        return (
                                            <button
                                                key={ck}
                                                onClick={() => setFormColor(ck)}
                                                title={ck.charAt(0).toUpperCase() + ck.slice(1)}
                                                style={{
                                                    width: 28, height: 28,
                                                    borderRadius: 8,
                                                    background: COLORS[ck].bg,
                                                    border: selected ? '3px solid #333' : '2px solid transparent',
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                    transition: 'border 0.15s',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={{
                                        fontSize: 12, color: '#888',
                                        fontFamily: 'Poppins', fontWeight: 500,
                                    }}>
                                        Start Week
                                    </label>
                                    <select
                                        value={formStartDate}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setFormStartDate(v);
                                            if (v > formEndDate) setFormEndDate(v);
                                        }}
                                        style={selectStyle}
                                    >
                                        {dropdownWeeks.map(({ iso, date }) => (
                                            <option key={iso} value={iso}>
                                                {formatWeekHeader(date)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={{
                                        fontSize: 12, color: '#888',
                                        fontFamily: 'Poppins', fontWeight: 500,
                                    }}>
                                        End Week
                                    </label>
                                    <select
                                        value={formEndDate}
                                        onChange={(e) => setFormEndDate(e.target.value)}
                                        style={selectStyle}
                                    >
                                        {dropdownWeeks.map(({ iso, date }) => (
                                            <option key={iso} value={iso} disabled={iso < formStartDate}>
                                                {formatWeekHeader(date)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 2,
                            }}>
                                {isEditing ? (
                                    <button
                                        onClick={handleDelete}
                                        onMouseEnter={() => setDeleteHover(true)}
                                        onMouseLeave={() => setDeleteHover(false)}
                                        style={{
                                            background: deleteHover ? '#DC2626' : 'none',
                                            border: deleteHover ? 'none' : '1px solid #DC2626',
                                            borderRadius: 12,
                                            padding: '8px 14px',
                                            fontSize: 13, fontFamily: 'Poppins', fontWeight: 500,
                                            color: deleteHover ? 'white' : '#DC2626',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <div />
                                )}

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={closePopover}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #ddd',
                                            borderRadius: 12,
                                            padding: '8px 14px',
                                            fontSize: 13, fontFamily: 'Poppins', fontWeight: 500,
                                            color: '#666', cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        onMouseEnter={() => setSaveHover(true)}
                                        onMouseLeave={() => setSaveHover(false)}
                                        style={{
                                            background: saveHover ? '#e04e00' : '#FF5900',
                                            color: 'white', border: 'none',
                                            borderRadius: 12,
                                            padding: '8px 16px',
                                            fontSize: 13, fontFamily: 'Poppins', fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'background 0.2s ease',
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
