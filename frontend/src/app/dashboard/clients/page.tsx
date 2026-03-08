'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';


interface Client {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    business_name: string;
    company?: string;
    phone_number: string;
    additional_info: string;
    title?: string;
    relationship_owner?: string;
    status?: string;
    contact_medium?: string;
    date_of_contact?: string;
    where_met?: string;
    chat_summary?: string;
    outcome?: string;
    relationship_status?: string;
    tags: string[];
    created_at?: string;
    updated_at?: string;
}

// Tags stored as "label|#color"; plain strings fall back to default purple.
function parseTag(raw: string): { name: string; color: string } {
    const sep = raw.lastIndexOf('|#');
    if (sep !== -1) return { name: raw.slice(0, sep), color: raw.slice(sep + 1) };
    return { name: raw, color: '#8A38F5' };
}

type SortOption = 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc' | 'date-created' | 'date-updated';

export default function ClientsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSearch = searchParams.get('search') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(!!initialSearch);
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');

    // Fetch all clients on page load
    useEffect(() => {
        const fetchAllClients = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:3001/clients`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                const data = await res.json();
                const items = Array.isArray(data) ? data : data?.items ?? [];
                setAllClients(items);
            } catch (err: any) {
                console.error('Failed to fetch clients:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllClients();
    }, []);

    // Search functionality with debounce
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timeout = setTimeout(() => {
            setLoading(true);
            setError(null);

            fetch(`http://localhost:3001/clients/search?q=${encodeURIComponent(searchQuery)}`, {
                credentials: 'include',
            })
                .then((res) => {
                    if (!res.ok) throw new Error(`Error: ${res.status}`);
                    return res.json();
                })
                .then((data) => setSearchResults(data))
                .catch((err) => { console.error('Search failed:', err); setError(err.message); })
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Apply filters and sorting
    const displayedClients = useMemo(() => {
        let result = isSearching ? searchResults : allClients;

        // Apply sorting
        const sorted = [...result];
        switch (sortBy) {
            case 'name-asc':
                sorted.sort((a, b) => `${a.first_name ?? ''} ${a.last_name ?? ''}`.localeCompare(`${b.first_name ?? ''} ${b.last_name ?? ''}`));
                break;
            case 'name-desc':
                sorted.sort((a, b) => `${b.first_name ?? ''} ${b.last_name ?? ''}`.localeCompare(`${a.first_name ?? ''} ${a.last_name ?? ''}`));
                break;
            case 'company-asc':
                sorted.sort((a, b) => (a.company || a.business_name || '').localeCompare(b.company || b.business_name || ''));
                break;
            case 'company-desc':
                sorted.sort((a, b) => (b.company || b.business_name || '').localeCompare(a.company || a.business_name || ''));
                break;
            case 'date-created':
                sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
                break;
            case 'date-updated':
                sorted.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
                break;
        }

        return sorted;
    }, [isSearching, searchResults, allClients, sortBy]);

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="clients" />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: '20px'
            }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Search Container */}
                    <SearchBar
                        placeholder="Type a name, email, company, note, or tag..."
                        onSearch={(value) => setSearchQuery(value)}
                    />

                    {/* Menu Dots */}
                    <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                    </div>
                </div>

                {/* Loading and Error Messages */}
                {loading && (
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '20px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        marginBottom: '20px'
                    }}>
                        <p style={{
                            color: '#FF5900',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            margin: 0
                        }}>
                            {isSearching ? 'Searching...' : 'Loading contacts...'}
                        </p>
                    </div>
                )}
                {error && (
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '20px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        marginBottom: '20px'
                    }}>
                        <p style={{
                            color: '#ef4444',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            margin: 0,
                            padding: 10,
                            backgroundColor: '#fef2f2',
                            borderRadius: 10
                        }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Results Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{
                            color: 'black',
                            fontSize: 18,
                            fontFamily: 'Poppins',
                            fontWeight: '600',
                            margin: 0
                        }}>
                            {isSearching ? `Search Results (${displayedClients.length})` : `All Contacts (${displayedClients.length})`}
                        </h3>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {isSearching && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearching(false);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #FF5900',
                                        borderRadius: '15px',
                                        padding: '6px 12px',
                                        color: '#FF5900',
                                        fontSize: 14,
                                        fontFamily: 'Poppins',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear Search
                                </button>
                            )}
                            {/* Sort dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    fontSize: '14px',
                                    fontFamily: 'Poppins',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                <option value="name-asc">Sort: Name (A-Z)</option>
                                <option value="name-desc">Sort: Name (Z-A)</option>
                                <option value="company-asc">Sort: Company (A-Z)</option>
                                <option value="company-desc">Sort: Company (Z-A)</option>
                                <option value="date-created">Sort: Date Created (Newest)</option>
                                <option value="date-updated">Sort: Date Updated (Newest)</option>
                            </select>

                            <Link href="/dashboard/clients/add">
                                <button style={{
                                    background: '#FF5900',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease'
                                }}>
                                    Add New Contact
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Clients Table/List */}
                    {displayedClients.length > 0 ? (
                        <div style={{
                            overflowX: 'auto'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 158, 77, 0.20)' }}>
                                    <tr>
                                        {['Name', 'Company', 'Title', 'Relationship Owner', 'Status', 'Contact Medium', 'Date of Contact', 'Where Met', 'Chat Summary', 'Outcome', 'Relationship Status', 'Tags'].map((header) => (
                                            <th key={header} style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                textAlign: 'left',
                                                fontFamily: 'Poppins',
                                                fontWeight: '600',
                                                fontSize: 14,
                                                color: '#FF5900',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedClients.map((client, idx) => (
                                        <tr
                                            key={client.id}
                                            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                            style={{
                                                background: idx % 2 === 0 ? 'white' : 'rgba(255, 245, 230, 0.50)',
                                                transition: 'background 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 158, 77, 0.15)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : 'rgba(255, 245, 230, 0.50)'}
                                        >
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)',
                                                fontWeight: '500'
                                            }}>
                                                <Link href={`/dashboard/clients/${client.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {client.first_name} {client.last_name}
                                                </Link>
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.company || client.business_name}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.title}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.relationship_owner}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.status}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.contact_medium}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {client.date_of_contact}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.where_met}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {client.chat_summary}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {client.outcome}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                                fontFamily: 'Poppins',
                                                fontSize: 14,
                                                color: 'rgba(26, 26, 26, 0.80)'
                                            }}>
                                                {client.relationship_status}
                                            </td>
                                            <td style={{
                                                border: '1px solid rgba(217, 217, 217, 0.30)',
                                                padding: 15,
                                            }}>
                                                <Link href={`/dashboard/clients/${client.id}`} style={{ textDecoration: 'none' }}>
                                                    {client.tags?.length ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {client.tags.map((raw, i) => {
                                                                const { name, color } = parseTag(raw);
                                                                return (
                                                                    <span key={i} style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        height: 35,
                                                                        paddingLeft: 29,
                                                                        paddingRight: 29,
                                                                        borderRadius: 20,
                                                                        background: color,
                                                                        color: 'white',
                                                                        fontSize: 12,
                                                                        fontFamily: 'Poppins',
                                                                        fontWeight: '600',
                                                                        whiteSpace: 'nowrap',
                                                                    }}>
                                                                        {name}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)' }}>—</span>
                                                    )}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center'
                        }}>
                            {isSearching ? (
                                <>
                                    <div style={{
                                        fontSize: 48,
                                        marginBottom: '15px'
                                    }}>🔍</div>
                                    <p style={{
                                        color: 'rgba(26, 26, 26, 0.50)',
                                        fontSize: 16,
                                        fontFamily: 'Poppins',
                                        margin: 0
                                    }}>
                                        No contacts found for "{searchQuery}"
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div style={{
                                        fontSize: 48,
                                        marginBottom: '15px'
                                    }}>👥</div>
                                    <p style={{
                                        color: 'rgba(26, 26, 26, 0.50)',
                                        fontSize: 16,
                                        fontFamily: 'Poppins',
                                        marginBottom: '20px'
                                    }}>
                                        No contacts yet. Add your first contact to get started!
                                    </p>
                                    <Link href="/dashboard/clients/add" style={{ textDecoration: 'none' }}>
                                        <button style={{
                                            background: 'linear-gradient(90deg, #FF5900, #FFAC80)',
                                            border: 'none',
                                            borderRadius: '25px',
                                            padding: '10px 20px',
                                            color: 'white',
                                            fontSize: 14,
                                            fontFamily: 'Poppins',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>
                                            Add First Contact
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}