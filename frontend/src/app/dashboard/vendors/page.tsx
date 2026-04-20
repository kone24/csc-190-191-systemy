'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';

interface Vendor {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status?: string;
    company?: string;
    business_name?: string;
    project_id?: string;
    project?: { project_id: string; name: string };
    date_meet?: string;
    outcome?: string;
    created_at?: string;
    updated_at?: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc' | 'date-created' | 'date-updated';

function VendorsPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [searchResults, setSearchResults] = useState<Vendor[]>([]);
    const [allVendors, setAllVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(!!initialSearch);
    const [sortBy, setSortBy] = useState<SortOption>('name-asc');

    // Fetch all vendors on page load
    useEffect(() => {
        const fetchAllVendors = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vendors`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                const data = await res.json();
                const items = Array.isArray(data) ? data : data?.items ?? [];
                setAllVendors(items);
            } catch (err: any) {
                console.error('Failed to fetch vendors:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllVendors();
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

            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vendors/search?q=${encodeURIComponent(searchQuery)}`, {
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

    // Apply sorting
    const displayedVendors = useMemo(() => {
        const result = isSearching ? searchResults : allVendors;
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
    }, [isSearching, searchResults, allVendors, sortBy]);

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="vendors" />

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
                    <SearchBar
                        placeholder="Search vendors..."
                        onSearch={(value) => setSearchQuery(value)}
                    />
                </div>

                {/* Loading and Error Messages */}
                {loading && (
                    <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                        <p style={{ color: '#FF5900', fontSize: 14, fontFamily: 'Poppins', margin: 0 }}>
                            {isSearching ? 'Searching...' : 'Loading vendors...'}
                        </p>
                    </div>
                )}
                {error && (
                    <div style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                        <p style={{ color: '#ef4444', fontSize: 14, fontFamily: 'Poppins', margin: 0, padding: 10, backgroundColor: '#fef2f2', borderRadius: 10 }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Results Section */}
                <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', margin: 0 }}>
                            {isSearching ? `Search Results (${displayedVendors.length})` : `All Vendors (${displayedVendors.length})`}
                        </h3>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {isSearching && (
                                <button
                                    onClick={() => { setSearchQuery(''); setIsSearching(false); }}
                                    style={{ background: 'transparent', border: '1px solid #FF5900', borderRadius: '15px', padding: '6px 12px', color: '#FF5900', fontSize: 14, fontFamily: 'Poppins', cursor: 'pointer' }}
                                >
                                    Clear Search
                                </button>
                            )}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '14px', fontFamily: 'Poppins', cursor: 'pointer', color: '#666' }}
                            >
                                <option value="name-asc">Sort: Name (A-Z)</option>
                                <option value="name-desc">Sort: Name (Z-A)</option>
                                <option value="company-asc">Sort: Company (A-Z)</option>
                                <option value="company-desc">Sort: Company (Z-A)</option>
                                <option value="date-created">Sort: Date Created (Newest)</option>
                                <option value="date-updated">Sort: Date Updated (Newest)</option>
                            </select>

                            <button
                                onClick={() => router.push('/dashboard/vendors/add')}
                                style={{ background: '#FF5900', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s ease' }}>
                                Add New Vendor
                            </button>
                        </div>
                    </div>

                    {/* Vendors Table */}
                    {displayedVendors.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 158, 77, 0.20)' }}>
                                    <tr>
                                        {['Name', 'Email', 'Status', 'Company', 'Project', 'Date Meet', 'Outcome'].map((header) => (
                                            <th key={header} style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, textAlign: 'left', fontFamily: 'Poppins', fontWeight: '600', fontSize: 14, color: '#FF5900', whiteSpace: 'nowrap' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedVendors.map((vendor, idx) => (
                                        <tr
                                            key={vendor.id}
                                            onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                                            style={{ background: idx % 2 === 0 ? 'white' : 'rgba(255, 245, 230, 0.50)', transition: 'background 0.2s', cursor: 'pointer' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 158, 77, 0.15)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : 'rgba(255, 245, 230, 0.50)'}
                                        >
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)', fontWeight: '500' }}>
                                                {vendor.first_name} {vendor.last_name}
                                            </td>
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)' }}>
                                                {vendor.email}
                                            </td>
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)' }}>
                                                {vendor.status}
                                            </td>
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)' }}>
                                                {vendor.company || vendor.business_name}
                                            </td>
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)' }}>
                                                {vendor.project?.name}
                                            </td>
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)', whiteSpace: 'nowrap' }}>
                                                {vendor.date_meet}
                                            </td>
                                            <td style={{ border: '1px solid rgba(217, 217, 217, 0.30)', padding: 15, fontFamily: 'Poppins', fontSize: 14, color: 'rgba(26, 26, 26, 0.80)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {vendor.outcome}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            {isSearching ? (
                                <>
                                    <div style={{ fontSize: 48, marginBottom: '15px' }}>🔍</div>
                                    <p style={{ color: 'rgba(26, 26, 26, 0.50)', fontSize: 16, fontFamily: 'Poppins', margin: 0 }}>
                                        No vendors found for "{searchQuery}"
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: 48, marginBottom: '15px' }}>🏢</div>
                                    <p style={{ color: 'rgba(26, 26, 26, 0.50)', fontSize: 16, fontFamily: 'Poppins', marginBottom: '20px' }}>
                                        No vendors yet. Add your first vendor to get started!
                                    </p>
                                    <button
                                        onClick={() => router.push('/dashboard/vendors/add')}
                                        style={{ background: 'linear-gradient(90deg, #FF5900, #FFAC80)', border: 'none', borderRadius: '25px', padding: '10px 20px', color: 'white', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', cursor: 'pointer' }}>
                                        Add First Vendor
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VendorsPage() {
    return (
        <Suspense>
            <VendorsPageInner />
        </Suspense>
    );
}