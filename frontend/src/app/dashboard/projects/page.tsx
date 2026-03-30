'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';


interface Project {
    project_id: string;
    name: string;
    status: string;
    service_type: string | null;
    start_date: string | null;
    end_date: string | null;
    client_id: string | null;
    client_name: string | null;
    owner_id: string | null;
    owner_name: string | null;
    task_count: number;
}


// Maps API status values → display label + badge colors
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; shadow: string }> = {
    'open':        { label: 'On Track',   bg: '#22C55E', text: 'black', shadow: 'rgba(34, 197, 94, 0.6)'   },
    'in_progress': { label: 'At Risk',    bg: '#F59E0B', text: 'black', shadow: 'rgba(245, 158, 11, 0.6)'  },
    'completed':   { label: 'Completed',  bg: '#9CA3AF', text: 'white', shadow: 'rgba(156, 163, 175, 0.6)' },
    'on_hold':     { label: 'On Hold',    bg: '#FF5900', text: 'white', shadow: 'rgba(255, 89, 0, 0.6)'    },
    'cancelled':   { label: 'Cancelled',  bg: '#EF4444', text: 'white', shadow: 'rgba(239, 68, 68, 0.6)'   },
    'behind':      { label: 'Behind',     bg: '#EF4444', text: 'white', shadow: 'rgba(239, 68, 68, 0.6)'   },
};

const DEFAULT_STATUS = { label: 'Unknown', bg: '#9CA3AF', text: 'white', shadow: 'rgba(156, 163, 175, 0.6)' };

const get_status_display = (status: string) => STATUS_MAP[status] ?? DEFAULT_STATUS;

export default function ProjectsPage() {
    const [projects, set_projects] = useState<Project[]>([]);
    const [loading, set_loading] = useState(true);
    const [search_query, set_search_query] = useState('');
    const [status_filter, set_status_filter] = useState('All');
    const [owner_filter, set_owner_filter] = useState('All');
    const [client_filter, set_client_filter] = useState('All');
    const [hovered_card, set_hovered_card] = useState<string | null>(null);
    const [show_modal, set_show_modal] = useState(false);
    const [create_hover, set_create_hover] = useState(false);
    const [edit_project, set_edit_project] = useState<Project | null>(null);
    const [edit_save_hover, set_edit_save_hover] = useState(false);
    const [show_delete_confirm, set_show_delete_confirm] = useState(false);
    const [delete_hover, set_delete_hover] = useState(false);

    useEffect(() => {
        const fetch_projects = async () => {
            try {
                const res = await fetch('http://localhost:3001/projects', { credentials: 'include' });
                const json = await res.json();
                set_projects(json.items ?? []);
            } catch (err) {
                console.error('Failed to fetch projects:', err);
                set_projects([]);
            } finally {
                set_loading(false);
            }
        };
        fetch_projects();
    }, []);

    // Derive unique owners and clients from fetched data
    const owners = useMemo(() => Array.from(new Set(projects.map(p => p.owner_name).filter(Boolean) as string[])), [projects]);
    const clients = useMemo(() => Array.from(new Set(projects.map(p => p.client_name).filter(Boolean) as string[])), [projects]);

    const filtered_projects = useMemo(() => {
        return projects.filter(p => {
            // Search
            if (search_query.trim()) {
                const q = search_query.toLowerCase();
                const matches = (p.name ?? '').toLowerCase().includes(q)
                    || (p.client_name ?? '').toLowerCase().includes(q)
                    || (p.owner_name ?? '').toLowerCase().includes(q);
                if (!matches) return false;
            }
            // Status
            if (status_filter !== 'All' && p.status !== status_filter) return false;
            // Owner
            if (owner_filter !== 'All' && p.owner_name !== owner_filter) return false;
            // Client
            if (client_filter !== 'All' && p.client_name !== client_filter) return false;
            return true;
        });
    }, [projects, search_query, status_filter, owner_filter, client_filter]);

    const format_date = (date_string: string) => {
        return new Date(date_string).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const get_initials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const select_style: React.CSSProperties = {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: 'white',
        fontSize: 14,
        fontFamily: 'Poppins',
        cursor: 'pointer',
        color: '#666',
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            <Sidebar activePage="projects" />

            <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 40px 20px 40px',
                gap: '20px',
                overflowX: 'hidden',
            }}>
                {/* Search Bar */}
                <SearchBar
                    placeholder="Search projects..."
                    onSearch={(value) => set_search_query(value)}
                />

                {/* Filter Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                }}>
                    {/* Left: Dropdown Filters */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            value={status_filter}
                            onChange={(e) => set_status_filter(e.target.value)}
                            style={select_style}
                        >
                            <option value="All">Status: All</option>
                            <option value="open">On Track</option>
                            <option value="in_progress">At Risk</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={owner_filter}
                            onChange={(e) => set_owner_filter(e.target.value)}
                            style={select_style}
                        >
                            <option value="All">Owner: All</option>
                            {owners.map(owner => (
                                <option key={owner} value={owner}>{owner}</option>
                            ))}
                        </select>

                        <select
                            value={client_filter}
                            onChange={(e) => set_client_filter(e.target.value)}
                            style={select_style}
                        >
                            <option value="All">Contact: All</option>
                            {clients.map(client => (
                                <option key={client} value={client}>{client}</option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Add New Project Button */}
                    <button
                        onClick={() => set_show_modal(true)}
                        style={{
                            background: '#FF5900',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                        }}>
                        + Add New Project
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#999',
                        fontFamily: 'Poppins',
                        fontSize: 16,
                    }}>
                        Loading projects...
                    </div>
                )}

                {/* Empty state — no projects from API */}
                {!loading && projects.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#999',
                        fontFamily: 'Poppins',
                        fontSize: 16,
                    }}>
                        No projects yet. Click &quot;+ Add New Project&quot; to create one.
                    </div>
                )}

                {/* Project Cards Grid */}
                {!loading && projects.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                }}>
                    {filtered_projects.map((project) => {
                        const status_display = get_status_display(project.status);
                        return (
                            <Link
                                key={project.project_id}
                                href={`/dashboard/projects/${project.project_id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div
                                    onMouseEnter={() => set_hovered_card(project.project_id)}
                                    onMouseLeave={() => set_hovered_card(null)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '15px',
                                        boxShadow: hovered_card === project.project_id
                                            ? `0px 4px 10px 0px ${status_display.shadow}`
                                            : '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 300ms ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '190px',
                                    }}>
                                    {/* Top Section */}
                                    <div style={{ padding: '18px 18px 0 18px', flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
                                        {/* Edit pencil + Delete trash icons — visible on card hover */}
                                        {hovered_card === project.project_id && (
                                            <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px', zIndex: 2 }}>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); set_edit_project(project); }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.85)',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '6px',
                                                        width: 28,
                                                        height: 28,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                    }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); set_show_delete_confirm(true); }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.85)',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '6px',
                                                        width: 28,
                                                        height: 28,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                    }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                        }}>
                                            <h3 style={{
                                                fontSize: 16,
                                                fontWeight: '600',
                                                color: 'black',
                                                fontFamily: 'Poppins',
                                                margin: 0,
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {project.name}
                                            </h3>
                                            <span style={{
                                                background: status_display.bg,
                                                color: status_display.text,
                                                padding: '6px 20px',
                                                borderRadius: '20px',
                                                fontSize: 14,
                                                fontWeight: '600',
                                                fontFamily: 'Poppins',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {status_display.label}
                                            </span>
                                        </div>
                                        <div style={{
                                            fontSize: 13,
                                            color: '#888',
                                            fontFamily: 'Poppins',
                                            marginTop: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {project.client_name ?? 'No contact'}
                                        </div>
                                    </div>

                                    {/* Status Accent Line */}
                                    <div style={{
                                        height: '3px',
                                        background: status_display.bg,
                                        margin: '12px 18px 0 18px',
                                    }} />

                                    {/* Bottom Section */}
                                    <div style={{
                                        padding: '12px 18px 16px 18px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        {/* Owner */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: '#999',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: 12,
                                                fontWeight: '600',
                                                fontFamily: 'Poppins',
                                            }}>
                                                {get_initials(project.owner_name ?? '?')}
                                            </div>
                                            <span style={{
                                                fontSize: 13,
                                                color: '#555',
                                                fontFamily: 'Poppins',
                                                fontWeight: '500',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100px',
                                            }}>
                                                {project.owner_name ?? 'Unassigned'}
                                            </span>
                                        </div>

                                        {/* Due date + task count */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '2px',
                                        }}>
                                            <span style={{
                                                fontSize: 12,
                                                color: '#999',
                                                fontFamily: 'Poppins',
                                            }}>
                                                Due {project.end_date ? format_date(project.end_date) : 'N/A'}
                                            </span>
                                            <span style={{
                                                fontSize: 12,
                                                color: '#999',
                                                fontFamily: 'Poppins',
                                            }}>
                                                {project.task_count} tasks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                )}

                {/* Filter empty state — projects exist but none match filters */}
                {!loading && projects.length > 0 && filtered_projects.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#999',
                        fontFamily: 'Poppins',
                        fontSize: 16,
                    }}>
                        No projects match your filters.
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {show_modal && (
                <div
                    onClick={() => set_show_modal(false)}
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
                                Create New Project
                            </h2>
                            <button
                                onClick={() => set_show_modal(false)}
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
                            {/* Row 1: Project Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Project Name</label>
                                <input type="text" placeholder="Enter project name" style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    border: '1px solid #ddd',
                                    fontSize: 14,
                                    fontFamily: 'Poppins',
                                    outline: 'none',
                                }} />
                            </div>

                            {/* Row 2: Vendor + Owner */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Contact</label>
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
                                        <option value="">Select contact</option>
                                        <option>John Smith</option>
                                        <option>Sarah Johnson</option>
                                        <option>Mike Chen</option>
                                        <option>Emily Davis</option>
                                        <option>Chris Wilson</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Owner</label>
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
                                        <option value="">Select owner</option>
                                        <option>Isaac</option>
                                        <option>Jez</option>
                                        <option>Matthew</option>
                                        <option>Forrest</option>
                                        <option>Ashley</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 3: Service Type + Status */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Service Type</label>
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
                                        <option value="">Select type</option>
                                        <option>Design</option>
                                        <option>Content</option>
                                        <option>Branding</option>
                                        <option>Research</option>
                                    </select>
                                </div>
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
                                        <option>On Track</option>
                                        <option>At Risk</option>
                                        <option>Behind</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 4: Start Date + End Date */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Start Date</label>
                                    <input type="date" style={{
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        color: '#666',
                                    }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>End Date</label>
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

                            {/* Row 5: Budget */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Budget</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        color: '#888',
                                        pointerEvents: 'none',
                                    }}>$</span>
                                    <input type="number" placeholder="0.00" style={{
                                        width: '100%',
                                        padding: '10px 14px 10px 28px',
                                        borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }} />
                                </div>
                            </div>

                            {/* Row 6: Description */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Description</label>
                                <textarea placeholder="Describe the project..." rows={4} style={{
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
                                    onClick={() => set_show_modal(false)}
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
                                    onClick={() => set_show_modal(false)}
                                    onMouseEnter={() => set_create_hover(true)}
                                    onMouseLeave={() => set_create_hover(false)}
                                    style={{
                                        background: create_hover ? '#e04e00' : '#FF5900',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '10px 28px',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                    }}>
                                    Create Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {edit_project && (
                <div
                    onClick={() => { set_edit_project(null); set_edit_save_hover(false); }}
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
                            <button onClick={() => { set_edit_project(null); set_edit_save_hover(false); }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999', padding: '0 4px', lineHeight: 1, fontFamily: 'Poppins' }}>&times;</button>
                        </div>

                        <div style={{ padding: '20px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Project Name</label>
                                <input type="text" defaultValue={edit_project.name} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Contact</label>
                                    <select defaultValue={edit_project.client_name ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option value="">Select contact</option>
                                        {clients.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Owner</label>
                                    <select defaultValue={edit_project.owner_name ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option value="">Select owner</option>
                                        {owners.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Service Type</label>
                                    <select style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>Design</option>
                                        <option>Content</option>
                                        <option>Branding</option>
                                        <option>Research</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Status</label>
                                    <select defaultValue={edit_project.status} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>On Track</option>
                                        <option>At Risk</option>
                                        <option>Behind</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Start Date</label>
                                    <input type="date" style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>End Date</label>
                                    <input type="date" defaultValue={edit_project.end_date ?? ''} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Budget</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontFamily: 'Poppins', color: '#888', pointerEvents: 'none' }}>$</span>
                                    <input type="number" placeholder="0.00" style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Description</label>
                                <textarea placeholder="Describe the project..." rows={4} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <button
                                    onClick={() => set_show_delete_confirm(true)}
                                    style={{ background: 'none', border: '1px solid #DC2626', borderRadius: '12px', padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', color: '#DC2626', cursor: 'pointer' }}>
                                    Delete Project
                                </button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { set_edit_project(null); set_edit_save_hover(false); }} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '12px', padding: '10px 24px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', color: '#666', cursor: 'pointer' }}>Cancel</button>
                                    <button
                                        onClick={() => { set_edit_project(null); set_edit_save_hover(false); }}
                                        onMouseEnter={() => set_edit_save_hover(true)}
                                        onMouseLeave={() => set_edit_save_hover(false)}
                                        style={{ background: edit_save_hover ? '#e04e00' : '#FF5900', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 28px', fontSize: 14, fontFamily: 'Poppins', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s ease' }}>
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
                                    onClick={() => { set_show_delete_confirm(false); set_delete_hover(false); set_edit_project(null); set_edit_save_hover(false); }}
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