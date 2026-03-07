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

// ──────────────────────────────────────────────
// Status badge + accent-line colors
// ──────────────────────────────────────────────
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
                            <option value="All">Client: All</option>
                            {CLIENTS.map(client => (
                                <option key={client} value={client}>{client}</option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Add New Project Button */}
                    <button style={{
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(max(250px, calc((100% - 96px) / 5)), 1fr))',
                    gap: '24px',
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
                                    }}>
                                    {/* Top Section */}
                                    <div style={{ padding: '22px 22px 0 22px' }}>
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
                                        }}>
                                            {project.client}
                                        </div>
                                    </div>

                                    {/* Status Accent Line */}
                                    <div style={{
                                        height: '3px',
                                        background: status_color.bg,
                                        margin: '16px 22px 0 22px',
                                    }} />

                                    {/* Bottom Section */}
                                    <div style={{
                                        padding: '16px 22px 22px 22px',
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
                                                background: 'linear-gradient(135deg, #FF5900, #FFAC80)',
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
        </div>
    );
}
