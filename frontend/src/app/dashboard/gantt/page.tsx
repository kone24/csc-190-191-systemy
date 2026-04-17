'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';
import { ManagerAndAbove } from '@/components/RoleGuard';

// ── Color palette ───────────────────────────────────────────────────────────
const COLORS: Record<string, { bg: string; text: string }> = {
    red: { bg: '#fca5a5', text: '#1f2937' },  // rose pastel
    teal: { bg: '#7dd3fc', text: '#1f2937' },  // sky pastel
    purple: { bg: '#c4b5fd', text: '#1f2937' },  // lavender pastel
    green: { bg: '#86efac', text: '#1f2937' },  // sage pastel
    blue: { bg: '#93c5fd', text: '#1f2937' },  // dusty blue pastel
    yellow: { bg: '#fdba74', text: '#1f2937' },  // peach pastel
    pink: { bg: '#f9a8d4', text: '#1f2937' },  // soft pink pastel
    mint: { bg: '#6ee7b7', text: '#1f2937' },  // mint / emerald pastel
    indigo: { bg: '#a5b4fc', text: '#1f2937' },  // indigo pastel
    amber: { bg: '#fde68a', text: '#1f2937' },  // amber pastel
    lime: { bg: '#d9f99d', text: '#1f2937' },  // lime pastel
    cyan: { bg: '#a5f3fc', text: '#1f2937' },  // cyan pastel
    mauve: { bg: '#e9d5ff', text: '#1f2937' },  // mauve / light violet pastel
    blush: { bg: '#fecdd3', text: '#1f2937' },  // blush / light rose pastel
};

const COLOR_KEYS = ['red', 'teal', 'purple', 'green', 'blue', 'yellow', 'pink', 'mint', 'indigo', 'amber', 'lime', 'cyan', 'mauve', 'blush'] as const;

// ── Layout constants ────────────────────────────────────────────────────────
const WEEK_COUNT = 8;
const LEFT_COL_WIDTH = 200;
const NAV_BTN_WIDTH = 28;
const LANE_HEIGHT = 28;
const LANE_GAP = 2;
const BAR_HEIGHT = 28;
const BAR_H_PAD = 4;
const HEADER_HEIGHT = 44;
const CLIENT_ROW_HEIGHT = 40;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function projectRowHeight(laneCount: number): number {
    const n = Math.max(laneCount, 1);
    // +1 extra lane at the bottom for the "add new" row
    const total = n + 1;
    const natural = total * LANE_HEIGHT + (total - 1) * LANE_GAP + 8;
    // Floor ensures single-bar rows have consistent breathing room
    return Math.max(natural, 72);
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
    /** Backend gantt_entry_id — undefined for unsaved / hardcoded entries */
    id?: string;
    text: string;
    color: string;
    assignee?: string | null;
    /** Monday of the start week, ISO string YYYY-MM-DD */
    startDate: string;
    /** Monday of the end week, ISO string YYYY-MM-DD */
    endDate: string;
}

interface ProjectRow {
    name: string;
    /** project_id from backend (undefined for hardcoded fallback rows) */
    projectId?: string;
    lanes: LaneEntry[][];
}

interface ClientGroup {
    client: string;
    /** client_id from backend (undefined for hardcoded fallback rows) */
    clientId?: string;
    projects: ProjectRow[];
}

/** Shape returned by GET /gantt-entries */
interface GanttEntryApi {
    gantt_entry_id: string;
    client_id: string | null;
    project_id: string | null;
    title: string;
    assignee: string | null;
    color: string;
    start_date: string;
    end_date: string;
    lane: number | null;
}

/** Shape returned by GET /projects items */
interface ProjectApi {
    project_id: string;
    name: string;
    client_id: string | null;
    client_name: string | null;
}

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

// ── Build ClientGroup[] from real projects + gantt entries ───────────────────
// Left-side structure (clients/projects) comes from the projects list.
// Gantt entry bars are matched to their project row by project_id.
function buildFromProjectsAndEntries(
    projects: ProjectApi[],
    entries: GanttEntryApi[],
): ClientGroup[] {
    // 1. Index entries by project_id for fast lookup
    const entryByProject = new Map<string, GanttEntryApi[]>();
    for (const e of entries) {
        if (!e.project_id) continue;
        if (!entryByProject.has(e.project_id)) entryByProject.set(e.project_id, []);
        entryByProject.get(e.project_id)!.push(e);
    }

    // 2. Group projects by client name to build section headers
    const clientBuckets = new Map<string, { clientId: string | null; projects: ProjectApi[] }>();
    for (const p of projects) {
        const clientName = p.client_name ?? p.client_id ?? 'Unassigned';
        if (!clientBuckets.has(clientName)) {
            clientBuckets.set(clientName, { clientId: p.client_id, projects: [] });
        }
        clientBuckets.get(clientName)!.projects.push(p);
    }

    // 3. Build ClientGroup[] — every project gets a row, bars come from entries
    const groups: ClientGroup[] = [];
    for (const [clientName, bucket] of clientBuckets) {
        const projectRows: ProjectRow[] = [];
        for (const p of bucket.projects) {
            const projectEntries = entryByProject.get(p.project_id) ?? [];
            const sorted = [...projectEntries].sort((a, b) => a.start_date.localeCompare(b.start_date));
            const lanes: LaneEntry[][] = [];
            for (const e of sorted) {
                const le: LaneEntry = {
                    id: e.gantt_entry_id,
                    text: e.title,
                    color: e.color,
                    assignee: e.assignee,
                    startDate: e.start_date,
                    endDate: e.end_date,
                };
                // Pack into first lane with no overlap
                let placed = false;
                for (let li = 0; li < lanes.length; li++) {
                    const hasOverlap = lanes[li].some(existing =>
                        datesOverlap(le.startDate, le.endDate, existing.startDate, existing.endDate),
                    );
                    if (!hasOverlap) {
                        lanes[li].push(le);
                        placed = true;
                        break;
                    }
                }
                if (!placed) lanes.push([le]);
            }
            if (lanes.length === 0) lanes.push([]);
            projectRows.push({ name: p.name, projectId: p.project_id, lanes });
        }
        groups.push({ client: clientName, clientId: bucket.clientId ?? undefined, projects: projectRows });
    }

    return groups;
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
    { color: 'mint', label: 'Mint' },
    { color: 'indigo', label: 'Indigo' },
    { color: 'amber', label: 'Amber' },
    { color: 'lime', label: 'Lime' },
    { color: 'cyan', label: 'Cyan' },
    { color: 'mauve', label: 'Mauve' },
    { color: 'blush', label: 'Blush' },
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
.gantt-cell { transition: background 0.12s; position: relative; }
.gantt-cell:hover { background: rgba(59, 130, 246, 0.06) !important; box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2); }
.gantt-cell:hover::after {
    content: '+';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(59, 130, 246, 0.35);
    font-size: 13px;
    font-weight: 600;
    pointer-events: none;
    line-height: 1;
}
.gantt-bar-inner { cursor: grab; user-select: none; }
.gantt-bar-inner:active { cursor: grabbing; }
`;

// ── Component ───────────────────────────────────────────────────────────────
export default function GanttPage() {
    const [windowStart, setWindowStart] = useState(() => getCurrentMonday());
    // Re-compute on the client after hydration so we never display a stale
    // server-rendered date (SSR runs new Date() at request/build time in UTC).
    useEffect(() => { setWindowStart(getCurrentMonday()); }, []);

    // ── Dynamic column width ─────────────────────────────────────────────
    const [containerWidth, setContainerWidth] = useState(0);
    const roRef = useRef<ResizeObserver | null>(null);

    const containerRef = useCallback((el: HTMLDivElement | null) => {
        if (roRef.current) {
            roRef.current.disconnect();
            roRef.current = null;
        }
        if (el) {
            const ro = new ResizeObserver(([entry]) => {
                setContainerWidth(entry.contentRect.width);
            });
            ro.observe(el);
            roRef.current = ro;
        }
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

    const visibleRangeLabel = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const start = windowStart;
        const end = addWeeks(windowStart, WEEK_COUNT - 1);
        const startStr = `${months[start.getMonth()]} ${start.getDate()}`;
        const endStr = `${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
        return `${startStr} — ${endStr}`;
    }, [windowStart]);

    // Index of the current week column within the visible window (-1 if not visible)
    const currentWeekCol = useMemo(() => {
        const cwIso = toIso(getCurrentMonday());
        return visibleWeekDates.findIndex(d => toIso(d) === cwIso);
    }, [visibleWeekDates]);

    // Keep colWidth accessible inside stable window event listeners
    const colWidthRef = useRef(colWidth);
    useEffect(() => { colWidthRef.current = colWidth; }, [colWidth]);

    // ── Drag-to-move state ───────────────────────────────────────────────
    interface DragData {
        clientIdx: number;
        projectIdx: number;
        laneIdx: number;
        entryIdx: number;
        rawStartCol: number;
        origStartDate: string;
        origEndDate: string;
        entryId?: string;
        startMouseX: number;
    }
    const draggingDataRef = useRef<DragData | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragKey, setDragKey] = useState('');
    const [dragDeltaCol, setDragDeltaCol] = useState(0);

    const [data, setData] = useState<ClientGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Global flat index for each project row (used for alternating backgrounds)
    const projectRowIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        let idx = 0;
        for (const group of data) {
            for (const project of group.projects) {
                map.set(`${group.client}-${project.name}`, idx++);
            }
        }
        return map;
    }, [data]);

    // ── Filter state ─────────────────────────────────────────────────────
    const [filterClient, setFilterClient] = useState('');
    const [filterProject, setFilterProject] = useState('');

    const clientOptions = useMemo(
        () => data.map(g => g.client),
        [data],
    );

    const projectOptions = useMemo(() => {
        const source = filterClient
            ? data.filter(g => g.client === filterClient)
            : data;
        const names: string[] = [];
        for (const g of source) {
            for (const p of g.projects) {
                if (!names.includes(p.name)) names.push(p.name);
            }
        }
        return names;
    }, [data, filterClient]);

    // Clear project filter when selected client changes and project no longer belongs to it
    useEffect(() => {
        if (filterProject && filterClient) {
            const group = data.find(g => g.client === filterClient);
            if (!group?.projects.some(p => p.name === filterProject)) {
                setFilterProject('');
            }
        }
    }, [filterClient, filterProject, data]);

    const filteredData = useMemo((): ClientGroup[] => {
        if (!filterClient && !filterProject) return data;
        return data
            .filter(g => !filterClient || g.client === filterClient)
            .map(g => ({
                ...g,
                projects: filterProject
                    ? g.projects.filter(p => p.name === filterProject)
                    : g.projects,
            }))
            .filter(g => g.projects.length > 0);
    }, [data, filterClient, filterProject]);

    const filtersActive = filterClient !== '' || filterProject !== '';

    const clearFilters = useCallback(() => {
        setFilterClient('');
        setFilterProject('');
    }, []);

    // Tooltip state
    const [tooltip, setTooltip] = useState<{
        x: number; y: number;
        text: string; assignee?: string | null; color: string;
    } | null>(null);

    // ── Fetch gantt entries + projects on mount ──────────────────────────
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const [entriesRes, projectsRes] = await Promise.all([
                    fetch(`${API}/gantt-entries`, { credentials: 'include' }),
                    fetch(`${API}/projects`, { credentials: 'include' }),
                ]);
                if (!entriesRes.ok) throw new Error(`Entries fetch failed: ${entriesRes.status}`);
                if (!projectsRes.ok) throw new Error(`Projects fetch failed: ${projectsRes.status}`);

                const entriesJson = await entriesRes.json();
                const projectsJson = await projectsRes.json();

                const items: GanttEntryApi[] = Array.isArray(entriesJson.items) ? entriesJson.items : [];
                const projects: ProjectApi[] = Array.isArray(projectsJson.items) ? projectsJson.items : [];

                if (!cancelled) {
                    setData(buildFromProjectsAndEntries(projects, items));
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load gantt data:', err);
                    setError('Failed to load gantt data. Showing sample data.');
                    setData(buildInitialData());
                    setLoading(false);
                    // Auto-dismiss error after 5s
                    setTimeout(() => setError(null), 5000);
                }
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    // Popover state
    const [popover, setPopover] = useState<PopoverTarget | null>(null);
    const [formText, setFormText] = useState('');
    const [formAssignee, setFormAssignee] = useState('');
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
    const goToday = useCallback(() => setWindowStart(getCurrentMonday()), []);

    // ── Bar drag: attach/detach global listeners when drag is active ─────
    useEffect(() => {
        if (!isDragging) return;

        const onMove = (e: MouseEvent) => {
            const d = draggingDataRef.current;
            if (!d) return;
            const delta = Math.round((e.clientX - d.startMouseX) / colWidthRef.current);
            setDragDeltaCol(prev => (prev === delta ? prev : delta));
        };

        const onUp = (e: MouseEvent) => {
            const d = draggingDataRef.current;
            draggingDataRef.current = null;
            setIsDragging(false);
            setDragDeltaCol(0);
            if (!d) return;

            const delta = Math.round((e.clientX - d.startMouseX) / colWidthRef.current);
            if (Math.abs(delta) === 0) return;

            resizedRef.current = true;
            const newStart = toIso(addWeeks(parseDate(d.origStartDate), delta));
            const newEnd = toIso(addWeeks(parseDate(d.origEndDate), delta));

            setData(prev => {
                const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
                next[d.clientIdx].projects[d.projectIdx].lanes[d.laneIdx][d.entryIdx].startDate = newStart;
                next[d.clientIdx].projects[d.projectIdx].lanes[d.laneIdx][d.entryIdx].endDate = newEnd;
                return next;
            });

            if (d.entryId) {
                fetch(`${API}/gantt-entries/${d.entryId}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start_date: newStart, end_date: newEnd }),
                }).catch(() => {
                    setError('Failed to save move. Please refresh.');
                    setTimeout(() => setError(null), 4000);
                });
            }
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isDragging]);

    // ── Start dragging a bar ─────────────────────────────────────────────
    const handleBarMouseDown = useCallback((
        e: React.MouseEvent,
        clientIdx: number,
        projectIdx: number,
        laneIdx: number,
        entryIdx: number,
        entry: LaneEntry,
    ) => {
        e.preventDefault(); // prevent text selection during drag
        setTooltip(null);
        const rawStartCol = weeksBetween(windowStart, parseDate(entry.startDate));
        draggingDataRef.current = {
            clientIdx, projectIdx, laneIdx, entryIdx,
            rawStartCol,
            origStartDate: entry.startDate,
            origEndDate: entry.endDate,
            entryId: entry.id,
            startMouseX: e.clientX,
        };
        setDragKey(`${clientIdx}-${projectIdx}-${laneIdx}-${entryIdx}`);
        setDragDeltaCol(0);
        setIsDragging(true);
    }, [windowStart]);

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
        setFormAssignee('');
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
        setFormAssignee(entry.assignee ?? '');
        setFormColor(entry.color);
        setFormStartDate(entry.startDate);
        setFormEndDate(entry.endDate);
        setSaveHover(false);
        setDeleteHover(false);
    }, []);

    const closePopover = useCallback(() => setPopover(null), []);

    // ── Save handler (POST new / PATCH existing) ──────────────────────
    const handleSave = useCallback(async () => {
        if (!popover || !formText.trim()) return;
        const start = formStartDate <= formEndDate ? formStartDate : formEndDate;
        const end = formStartDate <= formEndDate ? formEndDate : formStartDate;

        const isEdit = popover.laneIdx !== undefined && popover.entryIdx !== undefined;

        try {
            if (isEdit) {
                // Find existing entry to get its id
                const existingEntry = data[popover.clientIdx]?.projects[popover.projectIdx]
                    ?.lanes[popover.laneIdx!]?.[popover.entryIdx!];
                const entryId = existingEntry?.id;

                if (entryId) {
                    const res = await fetch(`${API}/gantt-entries/${entryId}`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: formText.trim(),
                            assignee: formAssignee.trim() || null,
                            color: formColor,
                            start_date: start,
                            end_date: end,
                            lane: popover.laneIdx,
                        }),
                    });
                    if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
                }

                // Update local state
                setData(prev => {
                    const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
                    const project = next[popover.clientIdx].projects[popover.projectIdx];
                    const entry = project.lanes[popover.laneIdx!][popover.entryIdx!];
                    entry.text = formText.trim();
                    entry.assignee = formAssignee.trim() || null;
                    entry.color = formColor;
                    entry.startDate = start;
                    entry.endDate = end;

                    const stillFits = !project.lanes[popover.laneIdx!].some((e, ei) => {
                        if (ei === popover.entryIdx) return false;
                        return datesOverlap(start, end, e.startDate, e.endDate);
                    });

                    if (!stillFits) {
                        project.lanes[popover.laneIdx!].splice(popover.entryIdx!, 1);
                        const newLane = findAvailableLane(project, start, end);
                        const movedEntry: LaneEntry = {
                            id: entry.id, text: formText.trim(), color: formColor,
                            assignee: formAssignee.trim() || null,
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
                    return next;
                });
            } else {
                // New entry — POST to backend
                const group = data[popover.clientIdx];
                const project = group?.projects[popover.projectIdx];
                // Compute target lane before the fetch so it can be sent in the body
                const targetLane = project ? findAvailableLane(project, start, end) : 0;
                const body: Record<string, unknown> = {
                    title: formText.trim(),
                    assignee: formAssignee.trim() || null,
                    color: formColor,
                    start_date: start,
                    end_date: end,
                    lane: targetLane,
                };
                if (group?.clientId) body.client_id = group.clientId;
                if (project?.projectId) body.project_id = project.projectId;

                const res = await fetch(`${API}/gantt-entries`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                let newId: string | undefined;
                if (res.ok) {
                    const json = await res.json();
                    newId = json.item?.gantt_entry_id;
                }

                // Update local state
                setData(prev => {
                    const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
                    const proj = next[popover.clientIdx].projects[popover.projectIdx];
                    const lane = findAvailableLane(proj, start, end);
                    const newEntry: LaneEntry = {
                        id: newId,
                        text: formText.trim(),
                        assignee: formAssignee.trim() || null,
                        color: formColor,
                        startDate: start,
                        endDate: end,
                    };
                    if (lane < proj.lanes.length) {
                        proj.lanes[lane].push(newEntry);
                        proj.lanes[lane].sort((a, b) => a.startDate.localeCompare(b.startDate));
                    } else {
                        proj.lanes.push([newEntry]);
                    }
                    return next;
                });
            }
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save entry. Please try again.');
            setTimeout(() => setError(null), 4000);
        }

        setPopover(null);
    }, [popover, formText, formAssignee, formColor, formStartDate, formEndDate, data]);

    // ── Delete handler (DELETE from backend) ──────────────────────────
    const handleDelete = useCallback(async () => {
        if (!popover || popover.laneIdx === undefined || popover.entryIdx === undefined) return;

        const existingEntry = data[popover.clientIdx]?.projects[popover.projectIdx]
            ?.lanes[popover.laneIdx]?.[popover.entryIdx];
        const entryId = existingEntry?.id;

        try {
            if (entryId) {
                const res = await fetch(`${API}/gantt-entries/${entryId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
            }

            setData(prev => {
                const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
                const project = next[popover.clientIdx].projects[popover.projectIdx];
                project.lanes[popover.laneIdx!].splice(popover.entryIdx!, 1);
                project.lanes = project.lanes.filter(l => l.length > 0);
                if (project.lanes.length === 0) project.lanes.push([]);
                return next;
            });
        } catch (err) {
            console.error('Delete failed:', err);
            setError('Failed to delete entry. Please try again.');
            setTimeout(() => setError(null), 4000);
        }

        setPopover(null);
    }, [popover, data]);

    // ── Resize stop handler (PATCH end_date to backend) ────────────────
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

        const existingEntry = data[clientIdx]?.projects[projectIdx]?.lanes[laneIdx]?.[entryIdx];
        const entryId = existingEntry?.id;

        // Optimistic local update
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev)) as ClientGroup[];
            next[clientIdx].projects[projectIdx].lanes[laneIdx][entryIdx].endDate = newEndDate;
            return next;
        });

        // Persist to backend
        if (entryId) {
            fetch(`${API}/gantt-entries/${entryId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ end_date: newEndDate }),
            }).catch(err => {
                console.error('Resize PATCH failed:', err);
                setError('Failed to save resize. Please refresh.');
                setTimeout(() => setError(null), 4000);
            });
        }
    }, [colWidth, data]);

    // ── Popover position clamped to viewport ────────────────────────────
    const [viewportSize, setViewportSize] = useState({ w: 1200, h: 800 });
    useEffect(() => {
        setViewportSize({ w: window.innerWidth, h: window.innerHeight });
        const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const popoverLeft = popover
        ? Math.min(popover.x, viewportSize.w - 300)
        : 0;
    const popoverTop = popover
        ? Math.min(popover.y, viewportSize.h - 540)
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
        <ManagerAndAbove>
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
                    {/* Error toast */}
                    {error && (
                        <div style={{
                            position: 'fixed', top: 20, right: 20, zIndex: 9999,
                            background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
                            borderRadius: 8, padding: '10px 16px',
                            fontFamily: 'Poppins', fontSize: 13, fontWeight: 500,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Top bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SearchBar placeholder="Search projects..." onSearch={() => { }} />
                    </div>

                    {/* Page title */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                        <h1 style={{
                            fontFamily: 'Poppins', fontWeight: 600, fontSize: 28,
                            color: '#1a1a1a', margin: 0,
                        }}>
                            Gantt Chart
                        </h1>
                        <span style={{
                            fontFamily: 'Poppins', fontWeight: 400, fontSize: 14,
                            color: '#6b7280',
                        }}>
                            {visibleRangeLabel}
                        </span>
                    </div>

                    {/* Filter bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                            value={filterClient}
                            onChange={(e) => { setFilterClient(e.target.value); setFilterProject(''); }}
                            style={{
                                fontFamily: 'Poppins', fontSize: 12, fontWeight: 500,
                                color: filterClient ? '#f97316' : '#374151',
                                background: 'white',
                                border: `1px solid ${filterClient ? '#f97316' : '#d1d5db'}`,
                                borderRadius: 8, padding: '5px 10px',
                                cursor: 'pointer', outline: 'none',
                            }}
                        >
                            <option value="">Client: All</option>
                            {clientOptions.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            style={{
                                fontFamily: 'Poppins', fontSize: 12, fontWeight: 500,
                                color: filterProject ? '#f97316' : '#374151',
                                background: 'white',
                                border: `1px solid ${filterProject ? '#f97316' : '#d1d5db'}`,
                                borderRadius: 8, padding: '5px 10px',
                                cursor: 'pointer', outline: 'none',
                            }}
                        >
                            <option value="">Project: All</option>
                            {projectOptions.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>

                        {filtersActive && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    background: 'none', border: 'none',
                                    fontFamily: 'Poppins', fontSize: 12, fontWeight: 500,
                                    color: '#f97316', cursor: 'pointer', padding: '5px 4px',
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

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
                    {loading ? (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'white', borderRadius: 12,
                            boxShadow: '0px 2px 8px rgba(0,0,0,0.10)',
                        }}>
                            <span style={{ fontFamily: 'Poppins', fontSize: 14, color: '#999' }}>Loading Gantt data...</span>
                        </div>
                    ) : (
                        <div
                            ref={containerRef}
                            style={{
                                flex: 1, overflowX: 'hidden', overflowY: 'auto', borderRadius: 12,
                                boxShadow: '0px 2px 8px rgba(0,0,0,0.10)',
                                background: 'white', width: '100%',
                            }}
                        >
                            <div style={{ width: '100%', fontFamily: 'Poppins' }}>
                                {/* Global grabbing cursor while dragging */}
                                {isDragging && <style>{`* { cursor: grabbing !important; user-select: none !important; }`}</style>}

                                {/* Header row */}
                                <div style={{
                                    display: 'flex',
                                    position: 'sticky', top: 0, zIndex: 3,
                                }}>
                                    <div style={{
                                        width: LEFT_COL_WIDTH, flexShrink: 0,
                                        height: HEADER_HEIGHT,
                                        background: '#f8f9fa', color: '#374151',
                                        fontWeight: 500, fontSize: 12,
                                        padding: '0 8px 0 16px',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        position: 'sticky', left: 0, zIndex: 4,
                                        borderBottom: '1px solid #e5e7eb',
                                        boxSizing: 'border-box',
                                    }}>
                                        <span>Client / Project</span>
                                        <button
                                            onClick={goToday}
                                            title="Jump to current week"
                                            style={{
                                                fontSize: 11, fontFamily: 'Poppins', fontWeight: 600,
                                                color: '#374151', background: 'none',
                                                border: '1px solid #d1d5db', borderRadius: 6,
                                                padding: '3px 8px', cursor: 'pointer',
                                                lineHeight: 1.4, flexShrink: 0,
                                            }}
                                        >
                                            Today
                                        </button>
                                    </div>

                                    <button
                                        onClick={goPrev}
                                        title="Previous week"
                                        style={{
                                            width: NAV_BTN_WIDTH, flexShrink: 0,
                                            height: HEADER_HEIGHT,
                                            background: '#f8f9fa', color: '#374151',
                                            border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, fontWeight: 700, fontFamily: 'Poppins',
                                            borderBottom: '1px solid #e5e7eb',
                                            borderLeft: '1px solid #e5e7eb',
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
                                                background: isCurrent ? '#fff7ed' : '#f8f9fa',
                                                color: isCurrent ? '#c2410c' : '#374151',
                                                fontWeight: isCurrent ? 700 : 500,
                                                fontSize: 12,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderBottom: '1px solid #e5e7eb',
                                                borderTop: isCurrent ? '2px solid #f97316' : 'none',
                                                borderLeft: '1px solid #e5e7eb',
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
                                            background: '#f8f9fa', color: '#374151',
                                            border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, fontWeight: 700, fontFamily: 'Poppins',
                                            borderBottom: '1px solid #e5e7eb',
                                            borderLeft: '1px solid #e5e7eb',
                                            boxSizing: 'border-box',
                                            padding: 0,
                                        }}
                                    >
                                        &#8250;
                                    </button>

                                </div>

                                {/* Body rows */}
                                {filteredData.map((group, clientIdx) => (
                                    <React.Fragment key={`client-${group.client}`}>
                                        <div style={{
                                            width: '100%',
                                            height: CLIENT_ROW_HEIGHT,
                                            background: '#e5e7eb', color: '#1f2937',
                                            fontWeight: 600, fontSize: 14,
                                            padding: '0 16px', letterSpacing: 1,
                                            display: 'flex', alignItems: 'center',
                                            position: 'sticky', left: 0, zIndex: 2,
                                            borderLeft: '3px solid #9ca3af',
                                        }}>
                                            {group.client}
                                        </div>

                                        {group.projects.map((project, projectIdx) => {
                                            const laneCount = Math.max(project.lanes.length, 1);
                                            const rowH = projectRowHeight(laneCount);
                                            const rowIdx = projectRowIndexMap.get(`${group.client}-${project.name}`) ?? 0;
                                            const rowBg = rowIdx % 2 === 0 ? '#fafafa' : 'white';

                                            return (
                                                <div
                                                    key={`${group.client}-${project.name}`}
                                                    style={{
                                                        display: 'flex',
                                                        borderBottom: '1px solid #e5e7eb',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: LEFT_COL_WIDTH, flexShrink: 0,
                                                        height: rowH,
                                                        background: rowBg,
                                                        padding: '10px 16px 4px 32px',
                                                        fontWeight: 500, fontSize: 13, color: '#374151',
                                                        display: 'flex', alignItems: 'flex-start',
                                                        position: 'sticky', left: 0, zIndex: 2,
                                                        borderRight: '1px solid #e5e7eb',
                                                        boxSizing: 'border-box',
                                                    }}>
                                                        {project.name}
                                                    </div>

                                                    <div style={{ width: NAV_BTN_WIDTH, flexShrink: 0, height: rowH, background: rowBg }} />

                                                    <div
                                                        style={{
                                                            position: 'relative',
                                                            flex: 1,
                                                            minWidth: 0,
                                                            height: rowH,
                                                            background: rowBg,
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
                                                                    borderLeft: wi > 0 ? '1px solid #e5e7eb' : 'none',
                                                                    background: wi === currentWeekCol ? 'rgba(249, 115, 22, 0.05)' : 'transparent',
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

                                                                // Apply drag offset for the bar being dragged
                                                                const barKey = `${clientIdx}-${projectIdx}-${laneIdx}-${entryIdx}`;
                                                                const isThisBarDragging = isDragging && dragKey === barKey;
                                                                const deltaCol = isThisBarDragging ? dragDeltaCol : 0;

                                                                // Clamp to visible window
                                                                const startCol = Math.max(rawStartCol + deltaCol, 0);
                                                                const endCol = Math.min(rawEndCol + deltaCol, WEEK_COUNT - 1);

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
                                                                            zIndex: isThisBarDragging ? 10 : 1,
                                                                            opacity: isThisBarDragging ? 0.85 : 1,
                                                                            transition: isThisBarDragging ? 'none' : undefined,
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
                                                                                className="gantt-bar-inner"
                                                                                onMouseDown={(e) => handleBarMouseDown(
                                                                                    e, clientIdx, projectIdx,
                                                                                    laneIdx, entryIdx, entry,
                                                                                )}
                                                                                onMouseEnter={(e) => {
                                                                                    if (!isDragging) setTooltip({
                                                                                        x: e.clientX, y: e.clientY,
                                                                                        text: entry.text,
                                                                                        assignee: entry.assignee,
                                                                                        color: entry.color,
                                                                                    });
                                                                                }}
                                                                                onMouseMove={(e) => {
                                                                                    if (!isDragging) setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                                                                                }}
                                                                                onMouseLeave={() => setTooltip(null)}
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
                                                                                    boxSizing: 'border-box',
                                                                                    boxShadow: isThisBarDragging ? '0 4px 12px rgba(0,0,0,0.18)' : undefined,
                                                                                }}
                                                                            >
                                                                                {entry.assignee ? `${entry.text} — ${entry.assignee}` : entry.text}
                                                                            </div>
                                                                        </ResizableBox>
                                                                    </div>
                                                                );
                                                            }),
                                                        )}

                                                    </div>

                                                    <div style={{ width: NAV_BTN_WIDTH, flexShrink: 0, height: rowH, background: rowBg }} />
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
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
                                background: COLORS[formColor]?.bg || '#93c5fd',
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

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={{
                                        fontSize: 12, color: '#888',
                                        fontFamily: 'Poppins', fontWeight: 500,
                                    }}>
                                        Assignee
                                    </label>
                                    <input
                                        type="text"
                                        value={formAssignee}
                                        onChange={(e) => setFormAssignee(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                                        placeholder="Optional"
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
                                                background: COLORS[formColor]?.bg ?? '#93c5fd',
                                                color: COLORS[formColor]?.text ?? '#1f2937', border: 'none',
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

            {/* ── Tooltip ─────────────────────────────────────────────────────── */}
            {tooltip && (
                <div style={{
                    position: 'fixed',
                    left: tooltip.x + 14,
                    top: tooltip.y - 12,
                    zIndex: 9000,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    maxWidth: 240,
                    pointerEvents: 'none',
                }}>
                    <div style={{ fontWeight: 600, color: '#1f2937', lineHeight: 1.4 }}>
                        {tooltip.text}
                    </div>
                    {tooltip.assignee && (
                        <div style={{ color: '#6b7280', marginTop: 4 }}>
                            Assignee: {tooltip.assignee}
                        </div>
                    )}
                    <div style={{
                        width: 20, height: 4, borderRadius: 2,
                        background: COLORS[tooltip.color]?.bg ?? '#93c5fd',
                        marginTop: 6,
                    }} />
                </div>
            )}
        </ManagerAndAbove>
    );
}
