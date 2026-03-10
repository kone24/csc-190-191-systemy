'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';


// Types
interface Task {
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Todo' | 'In Progress' | 'Review' | 'Done';
    assignee: string;
    due_date: string;
    description: string;
}

interface Phase {
    name: string;
    tasks: Task[];
}


// Mock data
const PROJECT_NAME = 'Nike Brand Refresh';
const PROJECT_STATUS = 'In Progress';
const PROJECT_DETAILS = {
    vendor: 'Nike',
    owner: 'Isaac',
    service_type: 'Branding',
    start_date: '2026-01-15',
    end_date: '2026-06-30',
    budget: 48000,
    description: 'Full brand refresh including logo redesign, updated color palette, typography system, and brand guidelines documentation for Nike\'s 2026 product line.',
};

const format_date = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const format_currency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const PHASES: Phase[] = [
    {
        name: 'Discovery',
        tasks: [
            { id: 'd1', title: 'Competitive Analysis', priority: 'High', status: 'Done', assignee: 'Isaac', due_date: '2026-02-10', description: 'Research and analyze top 5 competitors in the sportswear branding space, focusing on visual identity and messaging.' },
            { id: 'd2', title: 'Stakeholder Interviews', priority: 'Medium', status: 'In Progress', assignee: 'Jez', due_date: '2026-03-01', description: 'Conduct interviews with key stakeholders to gather requirements and brand vision alignment.' },
            { id: 'd3', title: 'Brand Audit Report', priority: 'Low', status: 'Review', assignee: 'Matthew', due_date: '2026-03-15', description: 'Compile a comprehensive audit of existing brand assets, touchpoints, and consistency issues.' },
            { id: 'd4', title: 'Market Research Survey', priority: 'High', status: 'Todo', assignee: 'Ashley', due_date: '2026-03-20', description: 'Design and distribute a consumer survey to gauge brand perception and awareness.' },
        ],
    },
    {
        name: 'Design',
        tasks: [
            { id: 'de1', title: 'Mood Board Creation', priority: 'Medium', status: 'Done', assignee: 'Forrest', due_date: '2026-03-05', description: 'Create mood boards exploring three visual directions for the brand refresh.' },
            { id: 'de2', title: 'Logo Concepts', priority: 'High', status: 'In Progress', assignee: 'Isaac', due_date: '2026-03-25', description: 'Develop 4-6 logo concept variations based on the approved mood board direction.' },
            { id: 'de3', title: 'Typography Selection', priority: 'Low', status: 'Todo', assignee: 'Jez', due_date: '2026-04-01', description: 'Select primary and secondary typefaces that align with the new brand identity.' },
            { id: 'de4', title: 'Color Palette Exploration', priority: 'Medium', status: 'Review', assignee: 'Matthew', due_date: '2026-04-10', description: 'Define primary, secondary, and accent color palettes with accessibility compliance.' },
            { id: 'de5', title: 'Brand Guidelines Draft', priority: 'High', status: 'Todo', assignee: 'Ashley', due_date: '2026-04-20', description: 'Draft the initial brand guidelines document covering logo usage, colors, and typography.' },
        ],
    },
    {
        name: 'Production',
        tasks: [
            { id: 'p1', title: 'Asset Export for Web', priority: 'Medium', status: 'In Progress', assignee: 'Forrest', due_date: '2026-05-01', description: 'Export all finalized brand assets in web-optimized formats (SVG, PNG, WebP).' },
            { id: 'p2', title: 'Print Collateral Layout', priority: 'High', status: 'Todo', assignee: 'Isaac', due_date: '2026-05-10', description: 'Design business cards, letterheads, and envelope templates using the new brand system.' },
            { id: 'p3', title: 'Social Media Templates', priority: 'Low', status: 'Done', assignee: 'Jez', due_date: '2026-04-28', description: 'Create reusable social media post templates for Instagram, Twitter, and LinkedIn.' },
        ],
    },
    {
        name: 'Review',
        tasks: [
            { id: 'r1', title: 'Internal Design Review', priority: 'High', status: 'Review', assignee: 'Matthew', due_date: '2026-05-20', description: 'Present all deliverables to the internal team for feedback and approval.' },
            { id: 'r2', title: 'Client Presentation Prep', priority: 'Medium', status: 'In Progress', assignee: 'Ashley', due_date: '2026-06-01', description: 'Prepare the client-facing presentation deck showcasing the brand refresh.' },
            { id: 'r3', title: 'Final Revisions', priority: 'High', status: 'Todo', assignee: 'Forrest', due_date: '2026-06-15', description: 'Incorporate client feedback and finalize all brand assets and documentation.' },
            { id: 'r4', title: 'Deliverables Handoff', priority: 'Low', status: 'Todo', assignee: 'Isaac', due_date: '2026-06-25', description: 'Package and hand off all final files, guidelines, and asset libraries to the client.' },
        ],
    },
];


// Column background colors (cycle if > 4)
const COLUMN_COLORS = [
    '#DFCCFF',
    '#B8D4F0',
    '#FFD4A8',
    'rgba(149, 255, 218, 0.8)',
];

// Priority badge colors
const PRIORITY_STYLES: Record<Task['priority'], { bg: string; text: string }> = {
    High:   { bg: '#FF0000', text: 'white' },
    Medium: { bg: '#FFF631', text: 'black' },
    Low:    { bg: '#28CC95', text: 'white' },
};

const STATUS_STYLES: Record<Task['status'], { bg: string; text: string }> = {
    'Todo':        { bg: '#9CA3AF', text: 'white' },
    'In Progress': { bg: '#3B82F6', text: 'white' },
    'Review':      { bg: '#8B5CF6', text: 'white' },
    'Done':        { bg: '#22C55E', text: 'white' },
};


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
                            {PROJECT_NAME}
                        </h1>

                        <span style={{
                            background: '#FFAC80',
                            color: 'black',
                            padding: '6px 20px',
                            borderRadius: '20px',
                            fontSize: 14,
                            fontWeight: '600',
                            fontFamily: 'Poppins',
                            whiteSpace: 'nowrap',
                        }}>
                            {PROJECT_STATUS}
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
                            { label: 'Vendor', value: PROJECT_DETAILS.vendor },
                            { label: 'Owner', value: PROJECT_DETAILS.owner },
                            { label: 'Service Type', value: PROJECT_DETAILS.service_type },
                            { label: 'Start Date', value: format_date(PROJECT_DETAILS.start_date) },
                            { label: 'End Date', value: format_date(PROJECT_DETAILS.end_date) },
                            { label: 'Budget', value: format_currency(PROJECT_DETAILS.budget) },
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
                        {PROJECT_DETAILS.description}
                    </p>
                </div>

                {/* Kanban Board */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    flex: 1,
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingBottom: '10px',
                }}>
                    {PHASES.map((phase, index) => {
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
                                {phase.tasks.map(task => {
                                    const pstyle = PRIORITY_STYLES[task.priority];
                                    const sstyle = STATUS_STYLES[task.status];
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => set_detail_task({ task, phase_index: index })}
                                            style={{
                                                background: 'white',
                                                borderRadius: '20px',
                                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                                                padding: '18px 20px 20px 20px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px',
                                                cursor: 'pointer',
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
                                                    color: 'black',
                                                    flex: 1,
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
                                                    {task.priority}
                                                </span>
                                            </div>

                                            {/* Assignee */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
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
                                                }}>
                                                    {get_initials(task.assignee)}
                                                </div>
                                                <span style={{
                                                    fontSize: 12,
                                                    color: '#666',
                                                    fontFamily: 'Poppins',
                                                }}>
                                                    {task.assignee}
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
                                                    {format_date(task.due_date)}
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
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Task Modal */}
            {active_modal_phase !== null && (() => {
                const phase_index = active_modal_phase;
                const phase_name = PHASES[phase_index].name;
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

                                {/* Row 2: Assignee + Priority */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Assignee</label>
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
                                            <option value="">Select assignee</option>
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
                const pstyle = PRIORITY_STYLES[task.priority];
                const sstyle = STATUS_STYLES[task.status];

                const close_modal = () => { set_detail_task(null); set_detail_editing(false); set_save_hover(false); set_edit_hover(false); };

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
                                                <label style={label_style}>Assignee</label>
                                                <select defaultValue={task.assignee} style={select_style}>
                                                    <option>Isaac</option>
                                                    <option>Jez</option>
                                                    <option>Matthew</option>
                                                    <option>Forrest</option>
                                                    <option>Ashley</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Priority</label>
                                                <select defaultValue={task.priority} style={select_style}>
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Status</label>
                                                <select defaultValue={task.status} style={select_style}>
                                                    <option>Todo</option>
                                                    <option>In Progress</option>
                                                    <option>Review</option>
                                                    <option>Done</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={label_style}>Due Date</label>
                                                <input type="date" defaultValue={task.due_date} style={{ ...input_style, color: '#666' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={label_style}>Description</label>
                                            <textarea defaultValue={task.description} rows={3} style={{ ...input_style, resize: 'vertical' }} />
                                        </div>

                                        {/* Edit Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
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
                                                {task.priority}
                                            </span>
                                            <span style={{
                                                background: sstyle.bg, color: sstyle.text,
                                                padding: '3px 12px', borderRadius: '12px',
                                                fontSize: 11, fontWeight: '600', fontFamily: 'Poppins',
                                            }}>
                                                {task.status}
                                            </span>
                                        </div>

                                        {/* Assignee */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={label_style}>Assignee</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%', background: '#999',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: 11, fontWeight: '600', fontFamily: 'Poppins', flexShrink: 0,
                                                }}>
                                                    {get_initials(task.assignee)}
                                                </div>
                                                <span style={{ fontSize: 14, color: 'black', fontFamily: 'Poppins', fontWeight: '500' }}>
                                                    {task.assignee}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Due Date */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={label_style}>Due Date</span>
                                            <span style={{ fontSize: 14, color: 'black', fontFamily: 'Poppins', fontWeight: '500' }}>
                                                {format_date(task.due_date)}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={label_style}>Description</span>
                                            <p style={{ fontSize: 13, color: '#444', fontFamily: 'Poppins', margin: 0, lineHeight: 1.6 }}>
                                                {task.description}
                                            </p>
                                        </div>

                                        {/* Read-Only Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
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
                                <input type="text" defaultValue={PROJECT_NAME} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Vendor</label>
                                    <select defaultValue={PROJECT_DETAILS.vendor} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>Nike</option>
                                        <option>Acme Corporation</option>
                                        <option>Tech Solutions Inc</option>
                                        <option>Digital Marketing Co</option>
                                        <option>Startup Ventures</option>
                                        <option>Creative Agency</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Owner</label>
                                    <select defaultValue={PROJECT_DETAILS.owner} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>Isaac</option>
                                        <option>Jez</option>
                                        <option>Matthew</option>
                                        <option>Forrest</option>
                                        <option>Ashley</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Service Type</label>
                                    <select defaultValue={PROJECT_DETAILS.service_type} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>Design</option>
                                        <option>Content</option>
                                        <option>Branding</option>
                                        <option>Research</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Status</label>
                                    <select defaultValue={PROJECT_STATUS} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>Open</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                        <option>On Hold</option>
                                        <option>Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Start Date</label>
                                    <input type="date" defaultValue={PROJECT_DETAILS.start_date} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>End Date</label>
                                    <input type="date" defaultValue={PROJECT_DETAILS.end_date} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Budget</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontFamily: 'Poppins', color: '#888', pointerEvents: 'none' }}>$</span>
                                    <input type="number" defaultValue={PROJECT_DETAILS.budget} style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Description</label>
                                <textarea defaultValue={PROJECT_DETAILS.description} rows={4} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none', resize: 'vertical' }} />
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
