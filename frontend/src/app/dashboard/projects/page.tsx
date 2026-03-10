'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';


// MOCK DATA swap this array for API data later
interface Project {
    id: string;
    title: string;
    client: string;
    status: 'Open' | 'In Progress' | 'On Hold' | 'Closed';
    owner: string;
    owner_avatar: string;
    due_date: string;
    task_count: number;
}

const MOCK_PROJECTS: Project[] = [
    { id: '1', title: 'Website Redesign', client: 'Some jit', status: 'In Progress', owner: 'Mario Gotez', owner_avatar: '', due_date: '2026-04-15', task_count: 12 },
    { id: '2', title: 'Mobile App MVP', client: 'Tech Solutions Inc', status: 'Open', owner: 'Buyako Saka', owner_avatar: '', due_date: '2026-05-01', task_count: 8 },
    { id: '3', title: 'Brand Identity Package', client: 'StartUp Ventures', status: 'On Hold', owner: 'Lamine Yamal', owner_avatar: '', due_date: '2026-03-30', task_count: 5 },
    { id: '4', title: 'SEO Optimization', client: 'Digital Marketing Co', status: 'Closed', owner: 'Harry Kane', owner_avatar: '', due_date: '2026-02-28', task_count: 10 },
    { id: '5', title: 'E-Commerce Platform', client: 'Global Systems Ltd', status: 'In Progress', owner: 'Alex Morgan', owner_avatar: '', due_date: '2026-06-10', task_count: 20 },
    { id: '6', title: 'CRM Integration', client: 'Creative Agency', status: 'Open', owner: 'James dean', owner_avatar: '', due_date: '2026-04-20', task_count: 7 },
    { id: '7', title: 'Annual Report Design', client: 'Acme Corporation', status: 'Closed', owner: 'Alex O', owner_avatar: '', due_date: '2026-01-31', task_count: 4 },
    { id: '8', title: 'Data Migration', client: 'Tech Solutions Inc', status: 'On Hold', owner: 'Conan O\'Brien', owner_avatar: '', due_date: '2026-05-15', task_count: 15 },
    { id: '9', title: 'Marketing Campaign Site', client: 'Digital Marketing Co', status: 'In Progress', owner: 'Arteta M', owner_avatar: '', due_date: '2026-04-05', task_count: 9 },
];


// Status badge + accent-line colors
const STATUS_COLORS: Record<Project['status'], { bg: string; text: string; shadow: string }> = {
    'Open':        { bg: 'rgba(91, 66, 255, 0.4)',  text: 'black', shadow: 'rgba(91, 66, 255, 0.6)'   },
    'In Progress': { bg: '#FFAC80',                  text: 'black', shadow: 'rgba(255, 172, 128, 1.0)' },
    'On Hold':     { bg: 'rgba(255, 246, 66, 0.32)', text: 'black', shadow: 'rgba(255, 246, 66, 0.6)'  },
    'Closed':      { bg: '#00F5A0',                  text: 'black', shadow: 'rgba(0, 245, 160, 0.6)'   },
};

// Derive unique owners and clients from the mock data
const OWNERS = Array.from(new Set(MOCK_PROJECTS.map(p => p.owner)));
const CLIENTS = Array.from(new Set(MOCK_PROJECTS.map(p => p.client)));

export default function ProjectsPage() {
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

    const filtered_projects = useMemo(() => {
        return MOCK_PROJECTS.filter(p => {
            // Search
            if (search_query.trim()) {
                const q = search_query.toLowerCase();
                const matches = p.title.toLowerCase().includes(q)
                    || p.client.toLowerCase().includes(q)
                    || p.owner.toLowerCase().includes(q);
                if (!matches) return false;
            }
            // Status
            if (status_filter !== 'All' && p.status !== status_filter) return false;
            // Owner
            if (owner_filter !== 'All' && p.owner !== owner_filter) return false;
            // Client
            if (client_filter !== 'All' && p.client !== client_filter) return false;
            return true;
        });
    }, [search_query, status_filter, owner_filter, client_filter]);

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
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Closed">Closed</option>
                        </select>

                        <select
                            value={owner_filter}
                            onChange={(e) => set_owner_filter(e.target.value)}
                            style={select_style}
                        >
                            <option value="All">Owner: All</option>
                            {OWNERS.map(owner => (
                                <option key={owner} value={owner}>{owner}</option>
                            ))}
                        </select>

                        <select
                            value={client_filter}
                            onChange={(e) => set_client_filter(e.target.value)}
                            style={select_style}
                        >
                            <option value="All">Vendor: All</option>
                            {CLIENTS.map(client => (
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

                {/* Project Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                }}>
                    {filtered_projects.map((project) => {
                        const status_color = STATUS_COLORS[project.status];
                        return (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div
                                    onMouseEnter={() => set_hovered_card(project.id)}
                                    onMouseLeave={() => set_hovered_card(null)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '15px',
                                        boxShadow: hovered_card === project.id
                                            ? `0px 4px 10px 0px ${status_color.shadow}`
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
                                        {hovered_card === project.id && (
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
                                                {project.title}
                                            </h3>
                                            <span style={{
                                                background: status_color.bg,
                                                color: status_color.text,
                                                padding: '6px 20px',
                                                borderRadius: '20px',
                                                fontSize: 14,
                                                fontWeight: '600',
                                                fontFamily: 'Poppins',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {project.status}
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
                                            {project.client}
                                        </div>
                                    </div>

                                    {/* Status Accent Line */}
                                    <div style={{
                                        height: '3px',
                                        background: status_color.bg,
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
                                                {get_initials(project.owner)}
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
                                                {project.owner}
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
                                                Due {format_date(project.due_date)}
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

                {/* Empty state */}
                {filtered_projects.length === 0 && (
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
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Vendor</label>
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
                                        <option value="">Select vendor</option>
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
                                        <option>Open</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                        <option>On Hold</option>
                                        <option>Cancelled</option>
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
                                <input type="text" defaultValue={edit_project.title} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Vendor</label>
                                    <select defaultValue={edit_project.client} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        <option>Nike</option>
                                        <option>Acme Corporation</option>
                                        <option>Tech Solutions Inc</option>
                                        <option>Digital Marketing Co</option>
                                        <option>Startup Ventures</option>
                                        <option>Creative Agency</option>
                                        <option>Some jit</option>
                                        <option>Global Systems Ltd</option>
                                        <option>StartUp Ventures</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>Owner</label>
                                    <select defaultValue={edit_project.owner} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666', background: 'white', cursor: 'pointer' }}>
                                        {OWNERS.map(o => <option key={o}>{o}</option>)}
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
                                    <input type="date" style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins', fontWeight: '500' }}>End Date</label>
                                    <input type="date" defaultValue={edit_project.due_date} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: 14, fontFamily: 'Poppins', color: '#666' }} />
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