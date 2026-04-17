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
    leadScore?: number | null;
    leadPotential?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
    leadRecommendation?: string | null;
}

// Tags stored as "label|#color"; plain strings fall back to default purple.
function parseTag(raw: string): { name: string; color: string } {
    const sep = raw.lastIndexOf('|#');
    if (sep !== -1) return { name: raw.slice(0, sep), color: raw.slice(sep + 1) };
    return { name: raw, color: '#8A38F5' };
}

type SortOption = 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc' | 'date-created' | 'date-updated' | 'potential-high-low' | 'potential-low-high';

export default function ClientsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
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

                const [clientsRes, recsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients`, {
                    credentials: 'include',
                }),
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/recommendations`, {
                    credentials: 'include',
                }),
                ]);

                if (!clientsRes.ok) throw new Error(`Error: ${clientsRes.status}`);
                if (!recsRes.ok) throw new Error(`Error: ${recsRes.status}`);

                const clientsData = await clientsRes.json();
                const recsData = await recsRes.json();

                const clients = Array.isArray(clientsData)
                ? clientsData
                : clientsData?.items ?? [];

                const recommendations = Array.isArray(recsData?.recommendations)
                ? recsData.recommendations
                : [];

                const recommendationMap = new Map(
                recommendations.map((rec: any) => [
                    rec.clientId,
                    {
                    leadScore: rec.score ?? null,
                    leadPotential: rec.details?.label ?? null,
                    leadRecommendation: rec.recommendation ?? null,
                    },
                ]),
                );

                const mergedClients = clients.map((client: Client) => ({
                ...client,
                ...(recommendationMap.get(client.id) ?? {
                    leadScore: null,
                    leadPotential: null,
                    leadRecommendation: null,
                }),
                }));

                setAllClients(mergedClients);
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

            const q = searchQuery.trim().toLowerCase();

            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clients/search?q=${encodeURIComponent(searchQuery)}`, {
                credentials: 'include',
            })
                .then((res) => {
                    if (!res.ok) throw new Error(`Error: ${res.status}`);
                    return res.json();
                })
                .then((data: Client[]) => {
                    // Also match clients whose ID starts with or contains the query
                    const idMatches = allClients.filter((c) => c.id?.toLowerCase().includes(q));
                    const merged = [...data];
                    for (const c of idMatches) {
                        if (!merged.some((m) => m.id === c.id)) merged.push(c);
                    }
                    setSearchResults(merged);
                })
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
            case 'potential-high-low': {
                const rank = (value?: string | null) =>
                    value === 'HIGH' ? 3 : value === 'MEDIUM' ? 2 : value === 'LOW' ? 1 : 0;

                sorted.sort((a, b) => {
                    const byPotential = rank(b.leadPotential) - rank(a.leadPotential);
                    if (byPotential !== 0) return byPotential;
                    return (b.leadScore ?? -1) - (a.leadScore ?? -1);
                });
                break;
                }

                case 'potential-low-high': {
                const rank = (value?: string | null) =>
                    value === 'LOW' ? 1 : value === 'MEDIUM' ? 2 : value === 'HIGH' ? 3 : 4;

                sorted.sort((a, b) => {
                    const byPotential = rank(a.leadPotential) - rank(b.leadPotential);
                    if (byPotential !== 0) return byPotential;
                    return (a.leadScore ?? Number.MAX_SAFE_INTEGER) - (b.leadScore ?? Number.MAX_SAFE_INTEGER);
                });
                break;
                }
        }

        return sorted;
    }, [isSearching, searchResults, allClients, sortBy]);

    // Compute the minimum prefix length that uniquely identifies each client's ID
    const shortIdMap = useMemo(() => {
        const ids = displayedClients.map((c) => c.id ?? '');
        const map: Record<string, string> = {};
        for (const id of ids) {
            let len = 4;
            while (len < id.length && ids.some((other) => other !== id && other.startsWith(id.slice(0, len)))) {
                len++;
            }
            map[id] = id.slice(0, len);
        }
        return map;
    }, [displayedClients]);

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="clients" />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: '20px',
                overflowX: 'hidden'
            }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Search Container */}
                    <SearchBar
                        placeholder="Type a name, email, company, note, or tag..."
                        onSearch={(value) => setSearchQuery(value)}
                    />

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
                                <option value="potential-high-low">Sort: Potential (High-Low)</option>
                                <option value="potential-low-high">Sort: Potential (Low-High)</option>
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
                                        {['Name', 'Company', 'Title', 'Relationship Owner', 'Status', 'Contact Medium', 'Date of Contact', 'Where Met', 'Chat Summary', 'Outcome', 'Tags', 'Potential'].map((header) => (
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
                                                {client.first_name} {client.last_name}
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
                                            }}>
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
                                            </td>
                                            <td
                                                style={{
                                                    border: '1px solid rgba(217, 217, 217, 0.30)',
                                                    padding: 15,
                                                    fontFamily: 'Poppins',
                                                    fontSize: 14,
                                                    color: 'rgba(26, 26, 26, 0.80)',
                                                    whiteSpace: 'nowrap',
                                                }}
                                                >
                                                {client.leadPotential ? (
                                                    <span
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '6px 14px',
                                                        borderRadius: 20,
                                                        fontSize: 12,
                                                        fontFamily: 'Poppins',
                                                        fontWeight: '600',
                                                        background:
                                                        client.leadPotential === 'HIGH'
                                                            ? '#22C55E'
                                                            : client.leadPotential === 'MEDIUM'
                                                            ? '#F59E0B'
                                                            : '#EF4444',
                                                        color: 'white',
                                                    }}
                                                    >
                                                    {client.leadPotential}
                                                    {client.leadScore != null ? ` (${client.leadScore})` : ''}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'rgba(26, 26, 26, 0.50)' }}>—</span>
                                                )}
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