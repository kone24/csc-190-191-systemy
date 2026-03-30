'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProvided, type DroppableStateSnapshot } from '@hello-pangea/dnd';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';


// Types
interface Task {
    task_id: string;
    project_id: string;
    phase_id: string;
    title: string;
    description: string | null;
    priority: number | null;
    status: string | null;
    due_date: string | null;
    assigned_to: string | null;
    assignee_name: string | null;
    assignees: string[];
    assignee_names: string[];
}

interface Phase {
    phase_id: string;
    name: string;
    tasks: Task[];
}

interface Project {
    project_id: string;
    name: string;
    status: string | null;
    service_type: string | null;
    start_date: string | null;
    end_date: string | null;
    client_id: string | null;
    client_name: string | null;
    owner_id: string | null;
    owner_name: string | null;
    task_count: number;
    budget: number | null;
    description: string | null;
}

// Maps API status values → display label + badge colors
const PROJECT_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    'open':        { label: 'On Track',   bg: '#22C55E', text: 'black' },
    'in_progress': { label: 'At Risk',    bg: '#F59E0B', text: 'black' },
    'completed':   { label: 'Completed',  bg: '#9CA3AF', text: 'white' },
    'on_hold':     { label: 'On Hold',    bg: '#FF5900', text: 'white' },
    'cancelled':   { label: 'Cancelled',  bg: '#EF4444', text: 'white' },
    'behind':      { label: 'Behind',     bg: '#EF4444', text: 'white' },
};

const DEFAULT_PROJECT_STATUS = { label: 'Unknown', bg: '#9CA3AF', text: 'white' };

const get_project_status_display = (status: string) => PROJECT_STATUS_MAP[status] ?? DEFAULT_PROJECT_STATUS;

const format_date = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const format_currency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });



// Column background colors (cycle if > 4)
const COLUMN_COLORS = [
    '#DFCCFF',
    '#B8D4F0',
    '#FFD4A8',
    'rgba(149, 255, 218, 0.8)',
];

// Priority badge colors (keyed by API integer values)
const PRIORITY_STYLES: Record<number, { label: string; bg: string; text: string }> = {
    1: { label: 'High',   bg: '#FF0000', text: 'white' },
    2: { label: 'Medium', bg: '#FFF631', text: 'black' },
    3: { label: 'Low',    bg: '#28CC95', text: 'white' },
};
const DEFAULT_PRIORITY = { label: 'N/A', bg: '#9CA3AF', text: 'white' };
const get_priority = (p: number | null) => PRIORITY_STYLES[p ?? 0] ?? DEFAULT_PRIORITY;

// Task status styles (keyed by API string values)
const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
    'todo':        { label: 'Todo',        bg: '#9CA3AF', text: 'white' },
    'in_progress': { label: 'In Progress', bg: '#3B82F6', text: 'white' },
    'review':      { label: 'Review',      bg: '#8B5CF6', text: 'white' },
    'done':        { label: 'Done',        bg: '#22C55E', text: 'white' },
};
const DEFAULT_STATUS = { label: 'Unknown', bg: '#9CA3AF', text: 'white' };
const get_status = (s: string | null) => STATUS_STYLES[s ?? ''] ?? DEFAULT_STATUS;


// Helpers
const get_initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

// Page
// Darker shade for hover on phase-colored buttons
const COLUMN_COLORS_HOVER = [
    '#c9b0f0',
    '#99bfdf',
    '#f0be8a',
    'rgba(110, 220, 180, 0.9)',
];

export default function ProjectDetailPage() {
    const params = useParams();
    const project_id = params.id as string;

    const [project, set_project] = useState<Project | null>(null);
    const [phases, set_phases] = useState<Phase[]>([]);
    const [loading, set_loading] = useState(true);
    const [active_modal_phase, set_active_modal_phase] = useState<number | null>(null);
    const [add_task_hover, set_add_task_hover] = useState(false);
    const [detail_task, set_detail_task] = useState<{ task: Task; phase_index: number } | null>(null);
    const [detail_editing, set_detail_editing] = useState(false);
    const [save_hover, set_save_hover] = useState(false);
    const [edit_hover, set_edit_hover] = useState(false);
    const [show_edit_project, set_show_edit_project] = useState(false);
    const [edit_project_save_hover, set_edit_project_save_hover] = useState(false);
    const [show_delete_confirm, set_show_delete_confirm] = useState(false);
    const [delete_hover, set_delete_hover] = useState(false);
    const [delete_task_hover, set_delete_task_hover] = useState(false);
    const [confirm_delete_task, set_confirm_delete_task] = useState(false);
    const [confirm_delete_hover, set_confirm_delete_hover] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                // Fetch project details from the list endpoint
                const projRes = await fetch('http://localhost:3001/projects', { credentials: 'include' });
                const projJson = await projRes.json();
                const proj = (projJson.items as Project[]).find(p => p.project_id === project_id) ?? null;
                set_project(proj);

                // Fetch phases
                const phasesRes = await fetch(`http://localhost:3001/projects/${project_id}/phases`, { credentials: 'include' });
                const phasesJson = await phasesRes.json();
                const apiPhases = phasesJson.items as { phase_id: string; project_id: string; name: string; order_index: number; assignee_id: string | null; assignee_name: string | null }[];

                // Fetch tasks for each phase in parallel
                const phasesWithTasks: Phase[] = await Promise.all(
                    apiPhases.map(async (ph) => {
                        const tasksRes = await fetch(`http://localhost:3001/phases/${ph.phase_id}/tasks`, { credentials: 'include' });
                        const tasksJson = await tasksRes.json();
                        return {
                            phase_id: ph.phase_id,
                            name: ph.name,
                            tasks: tasksJson.items as Task[],
                        };
                    })
                );

                set_phases(phasesWithTasks);
            } catch (err) {
                console.error('Failed to load project data:', err);
            } finally {
                set_loading(false);
            }
        }
        load();
    }, [project_id]);

    const on_drag_end = useCallback((result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;
        set_phases(prev => {
            const next = prev.map(p => ({ ...p, tasks: [...p.tasks] }));
            const src_col = next[Number(source.droppableId)];
            const dst_col = next[Number(destination.droppableId)];
            const [moved] = src_col.tasks.splice(source.index, 1);
            dst_col.tasks.splice(destination.index, 0, moved);
            return next;
        });
    }, []);

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            <Sidebar activePage="projects" />

            <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 30px',
                gap: '24px',
                overflowX: 'hidden',
            }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <span style={{ fontSize: 16, color: '#999', fontFamily: 'Poppins' }}>Loading project...</span>
                    </div>
                ) : !project ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <span style={{ fontSize: 16, color: '#999', fontFamily: 'Poppins' }}>Project not found.</span>
                    </div>
                ) : (<>
                {/* Page Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderBottom: '1px solid #E5E5E5',
                    paddingBottom: '16px',
                }}>
                    {/* Line 1: Back, Name, Status, Edit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <Link href="/dashboard/projects" style={{
                            color: '#FF5900',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}>
                            &larr; Back
                        </Link>

                        <h1 style={{
                            fontSize: 24,
                            fontWeight: '700',
                            fontFamily: 'Poppins',
                            color: 'black',
                            margin: 0,
                        }}>
                            {project.name}
                        </h1>

                        <span style={{
                            background: get_project_status_display(project.status ?? '').bg,
                            color: get_project_status_display(project.status ?? '').text,
                            padding: '6px 20px',
                            borderRadius: '20px',
                            fontSize: 14,
                            fontWeight: '600',
                            fontFamily: 'Poppins',
                            whiteSpace: 'nowrap',
                        }}>
                            {get_project_status_display(project.status ?? '').label}
                        </span>

                        <button
                            onClick={() => set_show_edit_project(true)}
                            style={{
                                background: '#FF5900',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 20px',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease',
                            }}>
                            Edit
                        </button>
                    </div>

                    {/* Line 2: Project details inline */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
                        {[
                            { label: 'Contact', value: project.client_name ?? 'N/A' },
                            { label: 'Owner', value: project.owner_name ?? 'Unassigned' },
                            { label: 'Service Type', value: project.service_type ?? 'N/A' },
                            { label: 'Start Date', value: project.start_date ? format_date(project.start_date) : 'N/A' },
                            { label: 'End Date', value: project.end_date ? format_date(project.end_date) : 'N/A' },
                            { label: 'Budget', value: project.budget != null ? format_currency(project.budget) : 'N/A' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 10, color: '#999', fontFamily: 'Poppins', fontWeight: '500' }}>
                                    {item.label}
                                </span>
                                <span style={{ fontSize: 15, color: 'black', fontFamily: 'Poppins', fontWeight: '700' }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Line 3: Description */}
                    <p style={{
                        fontSize: 13,
                        color: '#444',
                        fontFamily: 'Poppins',
                        margin: '-4px 0 0 0',
                        lineHeight: 1.4,
                    }}>
                        {project.description ?? ''}
                    </p>
                </div>

                {/* Kanban Board */}
                <DragDropContext onDragEnd={on_drag_end}>
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    flex: 1,
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingBottom: '10px',
                }}>
                    {phases.map((phase, index) => {
                        const col_color = COLUMN_COLORS[index % COLUMN_COLORS.length];
                        return (
                            <div key={phase.name} style={{
                                background: col_color,
                                borderRadius: '20px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                                padding: '18px',
                                minWidth: '250px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                            }}>
                                {/* Column Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span style={{
                                        fontSize: 16,
                                        fontWeight: '700',
                                        fontFamily: 'Poppins',
                                        color: 'black',
                                    }}>
                                        {phase.name}
                                    </span>
                                    <button
                                        onClick={() => set_active_modal_phase(index)}
                                        style={{
                                            background: 'rgba(255,255,255,0.75)',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            borderRadius: '8px',
                                            padding: '4px 12px',
                                            fontSize: 13,
                                            fontFamily: 'Poppins',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            color: 'black',
                                        }}>
                                        + Add Task
                                    </button>
                                </div>

                                <span style={{
                                    fontSize: 12,
                                    color: 'rgba(0,0,0,0.5)',
                                    fontFamily: 'Poppins',
                                }}>
                                    {phase.tasks.length} tasks
                                </span>

                                {/* Task Cards */}
                                <Droppable droppableId={String(index)}>
                                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px',
                                                minHeight: '40px',
                                                borderRadius: '12px',
                                                padding: snapshot.isDraggingOver ? '6px' : '0px',
                                                background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.35)' : 'transparent',
                                                border: snapshot.isDraggingOver ? '2px dashed rgba(0,0,0,0.15)' : '2px dashed transparent',
                                                transition: 'background 200ms ease, border 200ms ease, padding 200ms ease',
                                            }}>
                                            {[...phase.tasks]
                                                .map((task, original_index) => ({ task, original_index }))
                                                .sort((a, b) => {
                                                    if (a.task.status === 'done' && b.task.status !== 'done') return 1;
                                                    if (a.task.status !== 'done' && b.task.status === 'done') return -1;
                                                    return 0;
                                                })
                                                .map(({ task, original_index }) => {
                                                const pstyle = get_priority(task.priority);
                                                const sstyle = get_status(task.status);
                                                const is_done = task.status === 'done';
                                                const display_names = task.assignee_names.length > 0 ? task.assignee_names : (task.assignee_name ? [task.assignee_name] : []);
                                                return (
                                                    <Draggable key={task.task_id} draggableId={task.task_id} index={original_index}>
                                                        {(drag_provided, drag_snapshot) => (
                                                            <div
                                                                ref={drag_provided.innerRef}
                                                                {...drag_provided.draggableProps}
                                                                {...drag_provided.dragHandleProps}
                                                                onClick={() => set_detail_task({ task, phase_index: index })}
                                                                style={{
                                                                    background: is_done ? '#f0f0f0' : 'white',
                                                                    borderRadius: '20px',
                                                                    padding: '18px 20px 20px 20px',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '10px',
                                                                    cursor: 'pointer',
                                                                    boxShadow: drag_snapshot.isDragging
                                                                        ? '0 8px 20px rgba(0,0,0,0.18)'
                                                                        : '0 2px 6px rgba(0,0,0,0.08)',
                                                                    opacity: is_done ? 0.5 : (drag_snapshot.isDragging ? 0.95 : 1),
                                                                    ...drag_provided.draggableProps.style,
                                                                }}>
                                                                {/* Title + Priority */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'flex-start',
                                                                    gap: '8px',
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: 14,
                                                                        fontWeight: '500',
                                                                        fontFamily: 'Poppins',
                                                                        color: is_done ? '#999' : 'black',
                                                                        flex: 1,
                                                                        textDecoration: is_done ? 'line-through' : 'none',
                                                                    }}>
                                                                        {task.title}
                                                                    </span>
                                                                    <span style={{
                                                                        background: pstyle.bg,
                                                                        color: pstyle.text,
                                                                        padding: '3px 12px',
                                                                        borderRadius: '12px',
                                                                        fontSize: 11,
                                                                        fontWeight: '600',
                                                                        fontFamily: 'Poppins',
                                                                        whiteSpace: 'nowrap',
                                                                    }}>
                                                                        {pstyle.label}
                                                                    </span>
                                                                </div>

                                                                {/* Assignees */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        {display_names.map((name, ai) => (
                                                                            <div key={ai} style={{
                                                                                width: 26,
                                                                                height: 26,
                                                                                borderRadius: '50%',
                                                                                background: '#999',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                color: 'white',
                                                                                fontSize: 11,
                                                                                fontWeight: '600',
                                                                                fontFamily: 'Poppins',
                                                                                flexShrink: 0,
                                                                                marginLeft: ai > 0 ? '-8px' : '0px',
                                                                                border: '2px solid white',
                                                                                boxSizing: 'content-box',
                                                                                zIndex: display_names.length - ai,
                                                                                position: 'relative',
                                                                            }}>
                                                                                {get_initials(name)}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <span style={{
                                                                        fontSize: 12,
                                                                        color: '#666',
                                                                        fontFamily: 'Poppins',
                                                                    }}>
                                                                        {display_names.length > 0 ? display_names.join(', ') : 'Unassigned'}
                                                                    </span>
                                                                </div>

                                                                {/* Due Date + Status */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: 11,
                                                                        color: '#999',
                                                                        fontFamily: 'Poppins',
                                                                    }}>
                                                                        {task.due_date ? format_date(task.due_date) : 'No date'}
                                                                    </span>
                                                                    <span style={{
                                                                        background: sstyle.bg,
                                                                        color: sstyle.text,
                                                                        padding: '2px 10px',
                                                                        borderRadius: '10px',
                                                                        fontSize: 10,
                                                                        fontWeight: '600',
                                                                        fontFamily: 'Poppins',
                                                                        whiteSpace: 'nowrap',
                                                                    }}>
                                                                        {sstyle.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
                </DragDropContext>
                </>)}
            </div>

            {/* Add Task Modal */}
            {active_modal_phase !== null && (() => {
                const phase_index = active_modal_phase;
                const phase_name = phases[phase_index].name;
                const accent = COLUMN_COLORS[phase_index % COLUMN_COLORS.length];
                const accent_hover = COLUMN_COLORS_HOVER[phase_index % COLUMN_COLORS_HOVER.length];
                return (
                    <div
                        onClick={() => { set_active_modal_phase(null); set_add_task_hover(false); }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                width: '500px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                            {/* Phase-colored accent stripe */}
                            <div style={{
                                height: '4px',
                                background: accent,
                                borderRadius: '20px 20px 0 0',
                            }} />

                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px 28px 0 28px',
                            }}>
                                <h2 style={{
                                    fontSize: 20,
                                    fontWeight: '700',
                                    fontFamily: 'Poppins',
                                    color: 'black',
                                    margin: 0,
                                }}>
                                    Add Task to {phase_name}
                                </h2>
                                <button
                                    onClick={() => { set_active_modal_phase(null); set_add_task_hover(false); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: 22,
                                        cursor: 'pointer',
                                        color: '#999',
                                        padding: '0 4px',
                                        lineHeight: 1,
                                        fontFamily: 'Poppins',
                                    }}>
                                    &times;
                                </button>
                            </div>

                            {/* Form */}
                            <div style={{ padding: '20px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Row 1: Task Title */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Task Title</label>
                                    <input type="text" placeholder="Enter task title" style={{
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        outline: 'none',
                                    }} />
                                </div>

                                {/* Row 2: Assignees + Priority */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Assignees</label>
                                        <select multiple style={{
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid #ddd',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            color: '#666',
                                            background: 'white',
                                            cursor: 'pointer',
                                            minHeight: '80px',
                                        }}>
                                            <option>Isaac</option>
                                            <option>Jez</option>
                                            <option>Matthew</option>
                                            <option>Forrest</option>
                                            <option>Ashley</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Priority</label>
                                        <select style={{
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid #ddd',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            color: '#666',
                                            background: 'white',
                                            cursor: 'pointer',
                                        }}>
                                            <option value="">Select priority</option>
                                            <option>High</option>
                                            <option>Medium</option>
                                            <option>Low</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Status + Due Date */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Status</label>
                                        <select style={{
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid #ddd',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            color: '#666',
                                            background: 'white',
                                            cursor: 'pointer',
                                        }}>
                                            <option value="">Select status</option>
                                            <option>Todo</option>
                                            <option>In Progress</option>
                                            <option>Review</option>
                                            <option>Done</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Due Date</label>
                                        <input type="date" style={{
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid #ddd',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            color: '#666',
                                        }} />
                                    </div>
                                </div>

                                {/* Row 4: Description */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Description</label>
                                    <textarea placeholder="Describe the task..." rows={3} style={{
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        outline: 'none',
                                        resize: 'vertical',
                                    }} />
                                </div>

                                {/* Footer Buttons */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                }}>
                                    <button
                                        onClick={() => { set_active_modal_phase(null); set_add_task_hover(false); }}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #ddd',
                                            borderRadius: '12px',
                                            padding: '10px 24px',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            fontWeight: '500',
                                            color: '#666',
                                            cursor: 'pointer',
                                        }}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { set_active_modal_phase(null); set_add_task_hover(false); }}
                                        onMouseEnter={() => set_add_task_hover(true)}
                                        onMouseLeave={() => set_add_task_hover(false)}
                                        style={{
                                            background: add_task_hover ? accent_hover : accent,
                                            color: 'black',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '10px 28px',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s ease',
                                        }}>
                                        Add Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Task Detail / Edit Modal */}
            {detail_task !== null && (() => {
                const { task, phase_index } = detail_task;
                const accent = COLUMN_COLORS[phase_index % COLUMN_COLORS.length];
                const accent_hover = COLUMN_COLORS_HOVER[phase_index % COLUMN_COLORS_HOVER.length];
                const pstyle = get_priority(task.priority);
                const sstyle = get_status(task.status);
                const detail_names = task.assignee_names.length > 0 ? task.assignee_names : (task.assignee_name ? [task.assignee_name] : []);

                const close_modal = () => { set_detail_task(null); set_detail_editing(false); set_save_hover(false); set_edit_hover(false); set_delete_task_hover(false); set_confirm_delete_task(false); set_confirm_delete_hover(false); };

                const label_style: React.CSSProperties = { fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' };
                const input_style: React.CSSProperties = { padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' };
                const select_style: React.CSSProperties = { ...input_style, color: '#666', background: 'white', cursor: 'pointer' };

                return (
                    <div
                        onClick={close_modal}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                width: '520px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                            {/* Phase-colored accent stripe */}
                            <div style={{ height: '4px', background: accent, borderRadius: '20px 20px 0 0' }} />

                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px 28px 0 28px',
                            }}>
                                <h2 style={{ fontSize: 20, fontWeight: '700', fontFamily: 'Poppins', color: 'black', margin: 0 }}>
                                    {detail_editing ? 'Edit Task' : task.title}
                                </h2>
                                <button
                                    onClick={close_modal}
                                    style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999', padding: '0 4px', lineHeight: 1, fontFamily: 'Poppins' }}>
                                    &times;
                                </button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '20px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {detail_editing ? (
                                    <>
                                        {/* Edit Mode */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={label_style}>Task Title</label>
                                            <input type="text" defaultValue={task.title} style={input_style} />
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Assignees</label>
                                                <select multiple defaultValue={task.assignees} style={{ ...select_style, minHeight: '80px' }}>
                                                    <option>Isaac</option>
                                                    <option>Jez</option>
                                                    <option>Matthew</option>
                                                    <option>Forrest</option>
                                                    <option>Ashley</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Priority</label>
                                                <select defaultValue={String(task.priority ?? '')} style={select_style}>
                                                    <option value="1">High</option>
                                                    <option value="2">Medium</option>
                                                    <option value="3">Low</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Status</label>
                                                <select defaultValue={task.status ?? 'todo'} style={select_style}>
                                                    <option value="todo">Todo</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="review">Review</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Due Date</label>
                                                <input type="date" defaultValue={task.due_date ?? ''} style={{ ...input_style, color: '#666' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={label_style}>Description</label>
                                            <textarea defaultValue={task.description ?? ''} rows={3} style={{ ...input_style, resize: 'vertical' }} />
                                        </div>

                                        {/* Edit Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                            <button
                                                onClick={() => set_confirm_delete_task(true)}
                                                onMouseEnter={() => set_delete_task_hover(true)}
                                                onMouseLeave={() => set_delete_task_hover(false)}
                                                style={{
                                                    background: delete_task_hover ? '#FEE2E2' : 'none', border: '1px solid #DC2626', borderRadius: '12px',
                                                    padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500',
                                                    color: '#DC2626', cursor: 'pointer', transition: 'background 0.2s ease',
                                                }}>
                                                Delete
                                            </button>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => { set_detail_editing(false); set_save_hover(false); }}
                                                    style={{
                                                        background: 'none', border: '1px solid #ddd', borderRadius: '12px',
                                                        padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500',
                                                        color: '#666', cursor: 'pointer',
                                                    }}>
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={close_modal}
                                                    onMouseEnter={() => set_save_hover(true)}
                                                    onMouseLeave={() => set_save_hover(false)}
                                                    style={{
                                                        background: save_hover ? '#e04e00' : '#FF5900',
                                                        color: 'white', border: 'none', borderRadius: '12px',
                                                        padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600',
                                                        cursor: 'pointer', transition: 'background 0.2s ease',
                                                    }}>
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Read-Only View */}
                                        {/* Priority + Status pills */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                background: pstyle.bg, color: pstyle.text,
                                                padding: '3px 12px', borderRadius: '12px',
                                                fontSize: 11, fontWeight: '600', fontFamily: 'Poppins',
                                            }}>
                                                {pstyle.label}
                                            </span>
                                            <span style={{
                                                background: sstyle.bg, color: sstyle.text,
                                                padding: '3px 12px', borderRadius: '12px',
                                                fontSize: 11, fontWeight: '600', fontFamily: 'Poppins',
                                            }}>
                                                {sstyle.label}
                                            </span>
                                        </div>

                                        {/* Assignees */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={label_style}>Assignees</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {detail_names.map((name, ai) => (
                                                        <div key={ai} style={{
                                                            width: 28, height: 28, borderRadius: '50%', background: '#999',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: 'white', fontSize: 11, fontWeight: '600', fontFamily: 'Poppins', flexShrink: 0,
                                                            marginLeft: ai > 0 ? '-8px' : '0px',
                                                            border: '2px solid white',
                                                            boxSizing: 'content-box',
                                                            zIndex: detail_names.length - ai,
                                                            position: 'relative',
                                                        }}>
                                                            {get_initials(name)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: 14, color: 'black', fontFamily: 'Poppins', fontWeight: '500' }}>
                                                    {detail_names.length > 0 ? detail_names.join(', ') : 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Due Date */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={label_style}>Due Date</span>
                                            <span style={{ fontSize: 14, color: 'black', fontFamily: 'Poppins', fontWeight: '500' }}>
                                                {task.due_date ? format_date(task.due_date) : 'No date'}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={label_style}>Description</span>
                                            <p style={{ fontSize: 13, color: '#444', fontFamily: 'Poppins', margin: 0, lineHeight: 1.6 }}>
                                                {task.description ?? 'No description.'}
                                            </p>
                                        </div>

                                        {/* Read-Only Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                            <button
                                                onClick={() => set_confirm_delete_task(true)}
                                                onMouseEnter={() => set_delete_task_hover(true)}
                                                onMouseLeave={() => set_delete_task_hover(false)}
                                                style={{
                                                    background: delete_task_hover ? '#FEE2E2' : 'none', border: '1px solid #DC2626', borderRadius: '12px',
                                                    padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500',
                                                    color: '#DC2626', cursor: 'pointer', transition: 'background 0.2s ease',
                                                }}>
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => set_detail_editing(true)}
                                                onMouseEnter={() => set_edit_hover(true)}
                                                onMouseLeave={() => set_edit_hover(false)}
                                                style={{
                                                    background: edit_hover ? '#e04e00' : '#FF5900',
                                                    color: 'white', border: 'none', borderRadius: '12px',
                                                    padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600',
                                                    cursor: 'pointer', transition: 'background 0.2s ease',
                                                }}>
                                                Edit
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Delete Task Confirmation Modal */}
            {confirm_delete_task && detail_task !== null && (
                <div
                    onClick={() => { set_confirm_delete_task(false); set_confirm_delete_hover(false); }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                    }}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            width: '420px',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}>
                        <div style={{ height: '4px', background: '#DC2626', borderRadius: '20px 20px 0 0' }} />
                        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: '700', fontFamily: 'Poppins', color: 'black', margin: 0 }}>
                                Delete Task?
                            </h2>
                            <p style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins', margin: 0, lineHeight: 1.5 }}>
                                Are you sure you want to delete this task? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { set_confirm_delete_task(false); set_confirm_delete_hover(false); }}
                                    style={{
                                        background: 'none', border: '1px solid #ddd', borderRadius: '12px',
                                        padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500',
                                        color: '#666', cursor: 'pointer',
                                    }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const { task, phase_index } = detail_task;
                                        set_phases(prev => prev.map((phase, i) =>
                                            i === phase_index
                                                ? { ...phase, tasks: phase.tasks.filter(t => t.task_id !== task.task_id) }
                                                : phase
                                        ));
                                        set_confirm_delete_task(false);
                                        set_confirm_delete_hover(false);
                                        set_detail_task(null);
                                        set_detail_editing(false);
                                        set_delete_task_hover(false);
                                    }}
                                    onMouseEnter={() => set_confirm_delete_hover(true)}
                                    onMouseLeave={() => set_confirm_delete_hover(false)}
                                    style={{
                                        background: confirm_delete_hover ? '#B91C1C' : '#DC2626',
                                        color: 'white', border: 'none', borderRadius: '12px',
                                        padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600',
                                        cursor: 'pointer', transition: 'background 0.2s ease',
                                    }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {show_edit_project && (
                <div
                    onClick={() => { set_show_edit_project(false); set_edit_project_save_hover(false); }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            width: '560px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 0 28px' }}>
                            <h2 style={{ fontSize: 20, fontWeight: '700', fontFamily: 'Poppins', color: 'black', margin: 0 }}>Edit Project</h2>
                            <button onClick={() => { set_show_edit_project(false); set_edit_project_save_hover(false); }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999', padding: '0 4px', lineHeight: 1, fontFamily: 'Poppins' }}>&times;</button>
                        </div>

                        <div style={{ padding: '20px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Project Name</label>
                                <input type="text" defaultValue={project?.name ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Contact</label>
                                    <input type="text" defaultValue={project?.client_name ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Owner</label>
                                    <input type="text" defaultValue={project?.owner_name ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Service Type</label>
                                    <input type="text" defaultValue={project?.service_type ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Status</label>
                                    <select defaultValue={project?.status ?? 'open'} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option value="open">On Track</option>
                                        <option value="in_progress">At Risk</option>
                                        <option value="completed">Completed</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Start Date</label>
                                    <input type="date" defaultValue={project?.start_date ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>End Date</label>
                                    <input type="date" defaultValue={project?.end_date ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Budget</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontFamily: 'Poppins', color: '#888', pointerEvents: 'none' }}>$</span>
                                    <input type="number" defaultValue={project?.budget ?? ''} style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Description</label>
                                <textarea defaultValue={project?.description ?? ''} rows={4} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <button
                                    onClick={() => set_show_delete_confirm(true)}
                                    style={{ background: 'none', border: '1px solid #DC2626', borderRadius: '12px', padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', color: '#DC2626', cursor: 'pointer' }}>
                                    Delete Project
                                </button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { set_show_edit_project(false); set_edit_project_save_hover(false); }} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '12px', padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', color: '#666', cursor: 'pointer' }}>Cancel</button>
                                    <button
                                        onClick={() => { set_show_edit_project(false); set_edit_project_save_hover(false); }}
                                        onMouseEnter={() => set_edit_project_save_hover(true)}
                                        onMouseLeave={() => set_edit_project_save_hover(false)}
                                        style={{ background: edit_project_save_hover ? '#e04e00' : '#FF5900', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s ease' }}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {show_delete_confirm && (
                <div
                    onClick={() => { set_show_delete_confirm(false); set_delete_hover(false); }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                    }}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            width: '420px',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}>
                        {/* Red accent stripe */}
                        <div style={{ height: '4px', background: '#DC2626', borderRadius: '20px 20px 0 0' }} />

                        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                            {/* Warning icon */}
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: '#FEE2E2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>

                            <h2 style={{ fontSize: 20, fontWeight: '700', fontFamily: 'Poppins', color: 'black', margin: 0 }}>
                                Delete Project?
                            </h2>
                            <p style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins', margin: 0, lineHeight: 1.5 }}>
                                Are you sure you want to delete this project? This action cannot be undone.
                            </p>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { set_show_delete_confirm(false); set_delete_hover(false); }}
                                    style={{
                                        background: 'none', border: '1px solid #ddd', borderRadius: '12px',
                                        padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500',
                                        color: '#666', cursor: 'pointer',
                                    }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { set_show_delete_confirm(false); set_delete_hover(false); set_show_edit_project(false); set_edit_project_save_hover(false); }}
                                    onMouseEnter={() => set_delete_hover(true)}
                                    onMouseLeave={() => set_delete_hover(false)}
                                    style={{
                                        background: delete_hover ? '#B91C1C' : '#DC2626',
                                        color: 'white', border: 'none', borderRadius: '12px',
                                        padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600',
                                        cursor: 'pointer', transition: 'background 0.2s ease',
                                    }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
