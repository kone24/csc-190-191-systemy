'use client';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { useState } from 'react';

interface ProjectTask {
    id: string;
    description: string;
    user?: {
        name: string;
        avatar: string;
        dueDate?: string;
        tag?: string;
        tagColor?: string;
    };
}

interface ProjectCard {
    id: string;
    title: string;
    tasks: ProjectTask[];
    phase?: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectCard[]>([
        {
            id: '1',
            title: 'Title of some Project',
            tasks: [
                {
                    id: '1',
                    description: 'Description of some tasks #1 extended to fill',
                    user: { name: 'John', avatar: '/images/images/account.png', dueDate: 'Due in 1 day', tag: 'Design Tag', tagColor: '#4CAF50' }
                },
                {
                    id: '2',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '3',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '4',
                    description: 'Description of some tasks #1',
                },
            ]
        },
        {
            id: '2',
            title: 'Title of some Project',
            tasks: [
                {
                    id: '1',
                    description: 'Description of some tasks #1 extended to fill',
                    user: { name: 'Jane', avatar: '/images/images/account.png', dueDate: 'Due in 1 day', tag: 'Design Tag', tagColor: '#9C27B0' }
                },
                {
                    id: '2',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '3',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '4',
                    description: 'Description of some tasks #1',
                },
            ]
        },
        {
            id: '3',
            title: 'Title of some Project',
            tasks: [
                {
                    id: '1',
                    description: 'Description of some tasks #1 extended to fill',
                    user: { name: 'Mike', avatar: '/images/images/account.png', dueDate: 'Due in 1 day', tag: 'Design Tag', tagColor: '#4CAF50' }
                },
                {
                    id: '2',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '3',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '4',
                    description: 'Description of some tasks #1',
                },
            ]
        },
        {
            id: '4',
            title: 'Title of some Project',
            tasks: [
                {
                    id: '1',
                    description: 'Description of some tasks #1 extended to fill',
                    user: { name: 'Sara', avatar: '/images/images/account.png', dueDate: 'Due in 1 day', tag: 'Design Tag', tagColor: '#9C27B0' }
                },
                {
                    id: '2',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '3',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '4',
                    description: 'Description of some tasks #1',
                },
            ]
        },
        {
            id: '5',
            title: 'Title of some Project',
            tasks: [
                {
                    id: '1',
                    description: 'Description of some tasks #1 extended to fill',
                    user: { name: 'Alex', avatar: '/images/images/account.png', dueDate: 'Due in 1 day', tag: 'Design Tag', tagColor: '#4CAF50' }
                },
                {
                    id: '2',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '3',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '4',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '5',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '6',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '7',
                    description: 'Description of some tasks #1',
                },
            ]
        },
        {
            id: '6',
            title: 'Title of some Project',
            tasks: [
                {
                    id: '1',
                    description: 'Description of some tasks #1 extended to fill',
                    user: { name: 'Chris', avatar: '/images/images/account.png', dueDate: 'Due in 1 day', tag: 'Design Tag', tagColor: '#9C27B0' }
                },
                {
                    id: '2',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '3',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '4',
                    description: 'Description of some tasks #1',
                },
                {
                    id: '5',
                    description: 'Description of some tasks #1',
                },
            ]
        }
    ]);

    const phases = [
        { id: 1, name: 'Phase #1', details: ['Detail #1', 'Detail #2'] },
        { id: 2, name: 'Phase #2', details: ['Detail #1', 'Detail #2'] },
        { id: 3, name: 'Phase #3', details: ['Detail #1', 'Detail #2'] },
        { id: 4, name: 'Phase #4', details: ['Detail #1', 'Detail #2'] },
    ];

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="projects" />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: '20px'
            }}>
                {/* Top Bar with Search and Filter */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <SearchBar placeholder="Search projects..." onSearch={(value) => console.log('Search:', value)} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Filter Button */}
                        <button style={{
                            background: '#FFAC80',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'black',
                            fontSize: 14,
                            fontFamily: 'Inter',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}>
                            <span>Filter</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6h18M9 12h6M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>

                        {/* Something Button */}
                        <button style={{
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            color: 'black',
                            fontSize: 14,
                            fontFamily: 'Inter',
                            fontWeight: '400',
                            cursor: 'pointer'
                        }}>
                            Something
                        </button>

                        {/* Menu Dots */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: 8,
                                    height: 8,
                                    background: '#666',
                                    borderRadius: '50%',
                                    cursor: 'pointer'
                                }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Phase Cards */}
                <div style={{
                    display: 'flex',
                    gap: '32px',
                    alignItems: 'center',
                    marginBottom: '30px',
                    overflowX: 'auto'
                }}>
                    {phases.map((phase) => (
                        <div key={phase.id} style={{
                            background: 'white',
                            borderRadius: '10px',
                            width: '267px',
                            height: '60px',
                            flexShrink: 0,
                            position: 'relative',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                            {/* Left colored border */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '10px',
                                height: '60px',
                                background: 'linear-gradient(180deg, rgba(255, 89, 0, 0.4) 0%, rgba(255, 255, 255, 0.4) 100%, rgba(255, 73, 0, 0.4) 100%)',
                                borderTopLeftRadius: '10px',
                                borderBottomLeftRadius: '10px'
                            }} />

                            {/* Phase Title */}
                            <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '5px',
                                fontSize: 12,
                                fontWeight: '600',
                                color: 'black',
                                fontFamily: 'Inter'
                            }}>
                                {phase.name}
                            </div>

                            {/* Plus Icon */}
                            <div style={{
                                position: 'absolute',
                                right: '16px',
                                top: '17px',
                                width: '25px',
                                height: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '25px',
                                    height: '5px',
                                    background: '#FFAC80',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '10px',
                                        width: '5px',
                                        height: '25px',
                                        background: '#FFAC80'
                                    }} />
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '42px',
                                display: 'flex',
                                gap: '20px',
                                fontSize: 10,
                                fontWeight: '600',
                                color: 'rgba(0,0,0,0.5)',
                                fontFamily: 'Inter'
                            }}>
                                {phase.details.map((detail, index) => (
                                    <span key={index}>{detail}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Projects Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    flex: 1
                }}>
                    {projects.map((project) => (
                        <div key={project.id} style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '250px'
                        }}>
                            {/* Project Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '15px'
                            }}>
                                <h3 style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: 'black',
                                    fontFamily: 'Inter',
                                    margin: 0,
                                    flex: 1
                                }}>
                                    {project.title}
                                </h3>
                                <button style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: 18,
                                    color: '#666',
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    +
                                </button>
                            </div>

                            {/* Tasks List */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {project.tasks.map((task) => (
                                    <div key={task.id} style={{
                                        fontSize: 12,
                                        color: '#666',
                                        fontFamily: 'Inter',
                                        lineHeight: 1.4
                                    }}>
                                        {task.description}
                                    </div>
                                ))}
                            </div>

                            {/* User Info */}
                            {project.tasks[0]?.user && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginTop: '15px',
                                    paddingTop: '15px',
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    <img
                                        src={project.tasks[0].user.avatar}
                                        alt={project.tasks[0].user.name}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {project.tasks[0].user.dueDate && (
                                            <span style={{
                                                background: '#FFB3BA',
                                                color: '#8B0000',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: 10,
                                                fontWeight: '500',
                                                fontFamily: 'Inter'
                                            }}>
                                                {project.tasks[0].user.dueDate}
                                            </span>
                                        )}
                                        {project.tasks[0].user.tag && (
                                            <span style={{
                                                background: project.tasks[0].user.tagColor || '#4CAF50',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: 10,
                                                fontWeight: '500',
                                                fontFamily: 'Inter'
                                            }}>
                                                {project.tasks[0].user.tag}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}