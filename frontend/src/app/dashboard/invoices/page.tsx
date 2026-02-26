'use client';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { useState } from 'react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue' | 'draft';
    dueDate: string;
    issueDate: string;
    description: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([
        {
            id: '1',
            invoiceNumber: 'INV-001',
            clientName: 'Acme Corporation',
            amount: 2500.00,
            status: 'paid',
            dueDate: '2026-02-10',
            issueDate: '2026-01-25',
            description: 'Website development services'
        },
        {
            id: '2',
            invoiceNumber: 'INV-002',
            clientName: 'Tech Solutions Inc',
            amount: 1800.50,
            status: 'pending',
            dueDate: '2026-02-20',
            issueDate: '2026-02-05',
            description: 'Mobile app consultation'
        },
        {
            id: '3',
            invoiceNumber: 'INV-003',
            clientName: 'Digital Marketing Co',
            amount: 3200.00,
            status: 'overdue',
            dueDate: '2026-02-01',
            issueDate: '2026-01-15',
            description: 'SEO optimization services'
        },
        {
            id: '4',
            invoiceNumber: 'INV-004',
            clientName: 'StartUp Ventures',
            amount: 950.75,
            status: 'draft',
            dueDate: '2026-02-25',
            issueDate: '2026-02-15',
            description: 'Logo design and branding'
        },
        {
            id: '5',
            invoiceNumber: 'INV-005',
            clientName: 'Global Systems Ltd',
            amount: 4500.00,
            status: 'pending',
            dueDate: '2026-02-28',
            issueDate: '2026-02-10',
            description: 'Database integration services'
        },
        {
            id: '6',
            invoiceNumber: 'INV-006',
            clientName: 'Creative Agency',
            amount: 1200.00,
            status: 'paid',
            dueDate: '2026-02-15',
            issueDate: '2026-01-30',
            description: 'UI/UX design services'
        }
    ]);

    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const getStatusStyle = (status: string) => {
        const styles = {
            paid: { background: '#4CAF50', color: 'white' },
            pending: { background: '#FFC107', color: 'black' },
            overdue: { background: '#F44336', color: 'white' },
            draft: { background: '#9E9E9E', color: 'white' }
        };
        return styles[status as keyof typeof styles] || styles.draft;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredInvoices = selectedStatus === 'all'
        ? invoices
        : invoices.filter(invoice => invoice.status === selectedStatus);

    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="invoices" />

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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SearchBar placeholder="Search invoices..." onSearch={(value) => console.log('Search:', value)} />

                        <button style={{
                            background: 'linear-gradient(90deg, #FF5900, #FFAC80)',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '10px 20px',
                            color: 'white',
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0px 4px 6px rgba(255, 89, 0, 0.3)'
                        }}>
                            + New Invoice
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF5900', marginBottom: '8px' }}>
                            {formatCurrency(totalAmount)}
                        </div>
                        <div style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins' }}>Total Amount</div>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: '8px' }}>
                            {formatCurrency(paidAmount)}
                        </div>
                        <div style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins' }}>Paid</div>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FFC107', marginBottom: '8px' }}>
                            {formatCurrency(pendingAmount)}
                        </div>
                        <div style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins' }}>Pending</div>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F44336', marginBottom: '8px' }}>
                            {formatCurrency(overdueAmount)}
                        </div>
                        <div style={{ fontSize: 14, color: '#666', fontFamily: 'Poppins' }}>Overdue</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    {[
                        { key: 'all', label: 'All Invoices', count: invoices.length },
                        { key: 'paid', label: 'Paid', count: invoices.filter(inv => inv.status === 'paid').length },
                        { key: 'pending', label: 'Pending', count: invoices.filter(inv => inv.status === 'pending').length },
                        { key: 'overdue', label: 'Overdue', count: invoices.filter(inv => inv.status === 'overdue').length },
                        { key: 'draft', label: 'Draft', count: invoices.filter(inv => inv.status === 'draft').length }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedStatus(tab.key)}
                            style={{
                                background: selectedStatus === tab.key ? '#FF5900' : 'white',
                                color: selectedStatus === tab.key ? 'white' : '#666',
                                border: selectedStatus === tab.key ? 'none' : '1px solid #e0e0e0',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {tab.label}
                            <span style={{
                                background: selectedStatus === tab.key ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                                borderRadius: '10px',
                                padding: '2px 6px',
                                fontSize: 12,
                                fontWeight: 'bold'
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Invoices Table */}
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    flex: 1
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 200px 150px 120px 120px 120px 1fr 100px',
                        gap: '20px',
                        padding: '20px',
                        background: '#f8f9fa',
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#333',
                        fontFamily: 'Poppins',
                        borderBottom: '1px solid #e0e0e0'
                    }}>
                        <div>Invoice #</div>
                        <div>Client</div>
                        <div>Amount</div>
                        <div>Status</div>
                        <div>Issue Date</div>
                        <div>Due Date</div>
                        <div>Description</div>
                        <div>Actions</div>
                    </div>

                    {/* Table Body */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filteredInvoices.map((invoice) => (
                            <div key={invoice.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '120px 200px 150px 120px 120px 120px 1fr 100px',
                                gap: '20px',
                                padding: '15px 20px',
                                borderBottom: '1px solid #f0f0f0',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                alignItems: 'center'
                            }}>
                                <div style={{ fontWeight: '600', color: '#FF5900' }}>
                                    {invoice.invoiceNumber}
                                </div>
                                <div style={{ color: '#333' }}>
                                    {invoice.clientName}
                                </div>
                                <div style={{ fontWeight: '600', color: '#333' }}>
                                    {formatCurrency(invoice.amount)}
                                </div>
                                <div>
                                    <span style={{
                                        ...getStatusStyle(invoice.status),
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: 12,
                                        fontWeight: '500',
                                        textTransform: 'capitalize'
                                    }}>
                                        {invoice.status}
                                    </span>
                                </div>
                                <div style={{ color: '#666' }}>
                                    {formatDate(invoice.issueDate)}
                                </div>
                                <div style={{ color: '#666' }}>
                                    {formatDate(invoice.dueDate)}
                                </div>
                                <div style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {invoice.description}
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        fontSize: 16
                                    }}>
                                        👁️
                                    </button>
                                    <button style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        fontSize: 16
                                    }}>
                                        ✏️
                                    </button>
                                    <button style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        fontSize: 16
                                    }}>
                                        📧
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}