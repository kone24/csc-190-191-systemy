'use client';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { useUser } from '@/contexts/UserContext';
import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled';

interface InvoiceRow {
    invoice_id: string;
    id: string; // client FK
    project_id: string | null;
    issued_by: string | null;
    invoice_number: string;
    status: InvoiceStatus;
    amount: number;
    due_date: string | null;
    payment_link: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    clients?: { id: string; first_name: string; last_name: string } | null;
    users?: { user_id: string; name: string } | null;
    project?: { project_id: string; name: string } | null;
}

interface ClientOption { id: string; first_name: string; last_name: string }
interface ProjectOption { project_id: string; name: string }
interface UserOption { user_id: string; name: string; email: string }

const emptyForm = {
    id: '',
    amount: '',
    project_id: '',
    owners: [] as string[],
    due_date: '',
    payment_link: '',
    status: 'unpaid' as string,
};

export default function InvoicesPage() {
    const { user } = useUser();
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);

    const fetchInvoices = useCallback(async () => {
        try {
            const res = await fetch(`${API}/invoices`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    // Fetch clients + projects for the dropdown when modal opens
    useEffect(() => {
        if (!showModal) return;
        fetch(`${API}/clients`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : data.items ?? data.clients ?? [];
                setClients(list);
            })
            .catch(() => { });
        fetch(`${API}/projects`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : data.items ?? data.projects ?? [];
                setProjects(list);
            })
            .catch(() => { });
        fetch(`${API}/users`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : data.items ?? data.users ?? [];
                setUsers(list);
            })
            .catch(() => { });
    }, [showModal]);

    const openCreate = () => {
        setEditingInvoice(null);
        setForm({ ...emptyForm, owners: user?.id ? [user.id] : [] });
        setShowModal(true);
    };

    const openEdit = (inv: InvoiceRow) => {
        setEditingInvoice(inv);
        const owners = (inv.metadata as Record<string, unknown>)?.owners;
        const ownerList = Array.isArray(owners) ? owners as string[] : inv.issued_by ? [inv.issued_by] : [];
        setForm({
            id: inv.id,
            amount: String(inv.amount),
            project_id: inv.project_id ?? '',
            owners: ownerList,
            due_date: inv.due_date ? inv.due_date.slice(0, 10) : '',
            payment_link: inv.payment_link ?? '',
            status: inv.status,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                id: form.id,
                amount: Number(form.amount),
                status: form.status,
            };
            if (form.project_id) payload.project_id = form.project_id;
            if (form.owners.length) payload.issued_by = form.owners[0];
            payload.metadata = { owners: form.owners };
            if (form.due_date) payload.due_date = new Date(form.due_date).toISOString();
            if (form.payment_link) payload.payment_link = form.payment_link;

            const url = editingInvoice
                ? `${API}/invoices/${editingInvoice.invoice_id}`
                : `${API}/invoices`;
            const method = editingInvoice ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowModal(false);
                fetchInvoices();
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Failed to save invoice');
            }
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (invoiceId: string) => {
        if (!confirm('Delete this invoice?')) return;
        await fetch(`${API}/invoices/${invoiceId}`, { method: 'DELETE', credentials: 'include' });
        fetchInvoices();
    };

    const handleMarkPaid = async (inv: InvoiceRow) => {
        await fetch(`${API}/invoices/${inv.invoice_id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'paid' }),
        });
        fetchInvoices();
    };

    const handleSearch = async (term: string) => {
        if (!term.trim()) { fetchInvoices(); return; }
        try {
            const res = await fetch(`${API}/invoices`, { credentials: 'include' });
            if (res.ok) {
                const all: InvoiceRow[] = await res.json();
                const q = term.toLowerCase();
                setInvoices(all.filter(inv => {
                    const name = inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}` : '';
                    return inv.invoice_number?.toLowerCase().includes(q)
                        || name.toLowerCase().includes(q)
                        || inv.status?.toLowerCase().includes(q)
                        || String(inv.amount).includes(q);
                }));
            }
        } catch { /* ignore */ }
    };

    const clientName = (inv: InvoiceRow) =>
        inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}`.trim() : '—';

    const getStatusStyle = (status: string) => {
        const styles: Record<string, { background: string; color: string }> = {
            paid: { background: '#4CAF50', color: 'white' },
            unpaid: { background: '#FFC107', color: 'black' },
            overdue: { background: '#F44336', color: 'white' },
            cancelled: { background: '#9E9E9E', color: 'white' },
        };
        return styles[status] || styles.cancelled;
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    };

    const filteredInvoices = selectedStatus === 'all'
        ? invoices
        : invoices.filter(inv => inv.status === selectedStatus);

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const paidAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
    const unpaidAmount = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0);
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.amount), 0);

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8,
        fontSize: 14, fontFamily: 'Poppins', background: 'white', color: '#333',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 13, fontWeight: '500', fontFamily: 'Poppins', color: '#555', marginBottom: 4, display: 'block',
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            <Sidebar activePage="invoices" />

            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)', padding: '20px 20px 20px 30px', gap: '20px',
            }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SearchBar placeholder="Search invoices..." onSearch={handleSearch} />
                        <button onClick={openCreate} style={{
                            background: 'linear-gradient(90deg, #FF5900, #FFAC80)', border: 'none', borderRadius: '25px',
                            padding: '10px 20px', color: 'white', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500',
                            cursor: 'pointer', boxShadow: '0px 4px 6px rgba(255, 89, 0, 0.3)',
                        }}>+ New Invoice</button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    {[
                        { amount: totalAmount, color: '#FF5900', label: 'Total Amount' },
                        { amount: paidAmount, color: '#4CAF50', label: 'Paid' },
                        { amount: unpaidAmount, color: '#FFC107', label: 'Unpaid' },
                        { amount: overdueAmount, color: '#F44336', label: 'Overdue' },
                    ].map(card => (
                        <div key={card.label} style={{
                            background: 'white', padding: '20px', borderRadius: '15px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: card.color, marginBottom: '8px' }}>
                                {formatCurrency(card.amount)}
                            </div>
                            <div style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins' }}>{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {[
                        { key: 'all', label: 'All Invoices', count: invoices.length },
                        { key: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
                        { key: 'unpaid', label: 'Unpaid', count: invoices.filter(i => i.status === 'unpaid').length },
                        { key: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length },
                        { key: 'cancelled', label: 'Cancelled', count: invoices.filter(i => i.status === 'cancelled').length },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setSelectedStatus(tab.key)} style={{
                            background: selectedStatus === tab.key ? '#FF5900' : 'white',
                            color: selectedStatus === tab.key ? 'white' : '#666',
                            border: selectedStatus === tab.key ? 'none' : '1px solid #e0e0e0',
                            borderRadius: '20px', padding: '8px 16px', fontSize: 14, fontFamily: 'Poppins',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            {tab.label}
                            <span style={{
                                background: selectedStatus === tab.key ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                                borderRadius: '10px', padding: '2px 6px', fontSize: 12, fontWeight: 'bold',
                            }}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Invoices Table */}
                <div style={{
                    background: 'white', borderRadius: '15px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden', flex: 1,
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '120px 200px 120px 120px 120px 120px 1fr 140px',
                        gap: '20px', padding: '20px', background: '#f8f9fa', fontSize: 14, fontWeight: '600',
                        color: '#333', fontFamily: 'Poppins', borderBottom: '1px solid #e0e0e0',
                    }}>
                        <div>Invoice #</div><div>Client</div><div>Amount</div><div>Status</div>
                        <div>Created</div><div>Due Date</div><div>Project</div><div>Actions</div>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#999', fontFamily: 'Poppins' }}>Loading...</div>
                        ) : filteredInvoices.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#999', fontFamily: 'Poppins' }}>No invoices found</div>
                        ) : filteredInvoices.map(invoice => (
                            <div key={invoice.invoice_id} style={{
                                display: 'grid', gridTemplateColumns: '120px 200px 120px 120px 120px 120px 1fr 140px',
                                gap: '20px', padding: '15px 20px', borderBottom: '1px solid #f0f0f0',
                                fontSize: 14, fontFamily: 'Poppins', alignItems: 'center',
                            }}>
                                <div style={{ fontWeight: '600', color: '#FF5900' }}>{invoice.invoice_number}</div>
                                <div style={{ color: '#333' }}>{clientName(invoice)}</div>
                                <div style={{ fontWeight: '600', color: '#333' }}>{formatCurrency(Number(invoice.amount))}</div>
                                <div>
                                    <span style={{
                                        ...getStatusStyle(invoice.status), padding: '4px 8px', borderRadius: '12px',
                                        fontSize: 12, fontWeight: '500', textTransform: 'capitalize',
                                    }}>{invoice.status}</span>
                                </div>
                                <div style={{ color: '#666' }}>{formatDate(invoice.created_at)}</div>
                                <div style={{ color: '#666' }}>{formatDate(invoice.due_date)}</div>
                                <div style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {invoice.project?.name ?? '—'}
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => openEdit(invoice)} title="Edit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: 16 }}>✏️</button>
                                    {invoice.status !== 'paid' && (
                                        <button onClick={() => handleMarkPaid(invoice)} title="Mark Paid" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4CAF50', fontSize: 16 }}>✅</button>
                                    )}
                                    <button onClick={() => handleDelete(invoice.invoice_id)} title="Delete" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336', fontSize: 16 }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }} onClick={() => setShowModal(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'white', borderRadius: 20, padding: 30, width: 520,
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    }}>
                        <h2 style={{ margin: '0 0 20px', fontFamily: 'Poppins', fontSize: 22, fontWeight: '600', color: '#111' }}>
                            {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Client *</label>
                                <select style={inputStyle} value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}>
                                    <option value="">Select client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Amount *</label>
                                <input style={inputStyle} type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                            </div>
                            <div>
                                <label style={labelStyle}>Owner(s)</label>
                                <div style={{
                                    border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px',
                                    maxHeight: 140, overflowY: 'auto', background: 'white',
                                }}>
                                    {users.map(u => {
                                        const checked = form.owners.includes(u.user_id);
                                        return (
                                            <label key={u.user_id} style={{
                                                display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
                                                fontSize: 14, fontFamily: 'Poppins', cursor: 'pointer', color: '#333',
                                            }}>
                                                <input type="checkbox" checked={checked} onChange={() => {
                                                    const next = checked
                                                        ? form.owners.filter(id => id !== u.user_id)
                                                        : [...form.owners, u.user_id];
                                                    setForm({ ...form, owners: next });
                                                }} />
                                                {u.name}
                                            </label>
                                        );
                                    })}
                                    {users.length === 0 && <span style={{ color: '#999', fontSize: 13 }}>Loading users...</span>}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Due Date</label>
                                <input style={inputStyle} type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Project</label>
                                <select style={inputStyle} value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                                    <option value="">None</option>
                                    {projects.map(p => (
                                        <option key={p.project_id} value={p.project_id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Payment Link</label>
                                <input style={inputStyle} value={form.payment_link} onChange={e => setForm({ ...form, payment_link: e.target.value })} placeholder="https://..." />
                            </div>
                            {editingInvoice && (
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                            <button onClick={() => setShowModal(false)} style={{
                                padding: '10px 20px', border: '1px solid #ddd', borderRadius: 10, background: 'white',
                                fontFamily: 'Poppins', fontSize: 14, cursor: 'pointer',
                            }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving || !form.id || !form.amount} style={{
                                padding: '10px 20px', border: 'none', borderRadius: 10,
                                background: saving ? '#ccc' : '#FF5900', color: 'white',
                                fontFamily: 'Poppins', fontSize: 14, fontWeight: '500', cursor: saving ? 'default' : 'pointer',
                            }}>{saving ? 'Saving...' : editingInvoice ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}