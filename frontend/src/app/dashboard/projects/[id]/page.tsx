'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function ProjectDetailPage() {
    const params = useParams();
    const project_id = params.id;

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            <Sidebar activePage="projects" />

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: '20px'
            }}>
                <Link href="/dashboard/projects" style={{
                    color: '#FF5900',
                    fontSize: 14,
                    fontFamily: 'Poppins',
                    textDecoration: 'none',
                    fontWeight: '500',
                }}>
                    &larr; Back to Projects
                </Link>

                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '40px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                }}>
                    <h2 style={{
                        fontSize: 24,
                        fontWeight: '600',
                        fontFamily: 'Poppins',
                        color: 'black',
                        marginBottom: '10px',
                    }}>
                        Project #{project_id}
                    </h2>
                    <p style={{
                        fontSize: 16,
                        color: '#888',
                        fontFamily: 'Poppins',
                    }}>
                        Project detail page coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
}
