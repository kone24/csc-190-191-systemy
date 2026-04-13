"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from '@/components/Sidebar';
import { PhoneNumberInput } from "@/components/PhoneNumberInput";

interface Project { project_id: string; name: string; }

interface VendorFormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    projectId: string;
    dateMeet: string;
    outcome: string;
    additionalInfo: string;
}

type FormErrors = Partial<Record<keyof VendorFormState, string>>;

const inputStyle: React.CSSProperties = {
    marginTop: '4px',
    display: 'block',
    width: '100%',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    padding: '8px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    outline: 'none',
    fontFamily: 'Poppins',
    boxSizing: 'border-box',
};

const errorInputStyle: React.CSSProperties = { ...inputStyle, border: '1px solid #fca5a5' };

const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' };

export default function AddVendorPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [form, setForm] = useState<VendorFormState>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        status: '',
        projectId: '',
        dateMeet: '',
        outcome: '',
        additionalInfo: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [message, setMessage] = useState<string | null>(null);

    // Fetch projects for dropdown
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => setProjects(Array.isArray(data) ? data : []))
            .catch(() => setProjects([]));
    }, []);

    function validate(): FormErrors {
        const errs: FormErrors = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.email.trim() && !form.phone.trim()) errs.email = 'Email or phone is required';
        return errs;
    }

    const handleChange = (field: keyof VendorFormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);

        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            const vendorData = {
                first_name: form.firstName,
                last_name: form.lastName || undefined,
                email: form.email || undefined,
                phone_number: form.phone || undefined,
                company: form.company || undefined,
                status: form.status || undefined,
                project_id: form.projectId || undefined,
                date_meet: form.dateMeet || undefined,
                outcome: form.outcome || undefined,
                additional_info: form.additionalInfo || undefined,
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vendors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(vendorData),
            });

            let data: any;
            try { data = await res.json(); } catch {
                setMessage(`❌ Server error: ${res.status} - Invalid response`);
                return;
            }

            if (res.ok && data.ok) {
                setMessage(`✅ Vendor created successfully!`);
                setTimeout(() => router.push('/dashboard/vendors'), 1500);
            } else {
                setMessage(`❌ ${data.message || 'Failed to create vendor'}`);
            }
        } catch {
            setMessage('❌ Network error: Could not connect to server. Make sure your backend is running.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            <Sidebar activePage="vendors" />

            <div style={{ flex: 1, minHeight: '100vh', background: '#f9fafb', padding: '32px 30px' }}>
                <main style={{ margin: '0 auto', maxWidth: '672px', padding: '0 16px' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#000', fontFamily: 'Poppins' }}>Add New Vendor</h1>
                        <p style={{ marginTop: '8px', color: '#6b7280', fontFamily: 'Poppins' }}>
                            Enter the vendor's information below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ borderRadius: '8px', background: '#ffffff', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>

                            {/* First Name */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>First Name <span style={{ color: '#ef4444' }}>*</span></span>
                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={handleChange('firstName')}
                                        style={errors.firstName ? errorInputStyle : inputStyle}
                                        placeholder="John"
                                    />
                                </label>
                                {errors.firstName && <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.firstName}</p>}
                            </div>

                            {/* Last Name */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Last Name</span>
                                    <input
                                        type="text"
                                        value={form.lastName}
                                        onChange={handleChange('lastName')}
                                        style={inputStyle}
                                        placeholder="Doe"
                                    />
                                </label>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>
                                        Email <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>(email or phone required)</span>
                                    </span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange('email')}
                                        style={errors.email ? errorInputStyle : inputStyle}
                                        placeholder="john@example.com"
                                    />
                                </label>
                                {errors.email && <p style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626', fontFamily: 'Poppins' }}>{errors.email}</p>}
                            </div>

                            {/* Company */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Company</span>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={handleChange('company')}
                                        style={inputStyle}
                                        placeholder="Company Name"
                                    />
                                </label>
                            </div>

                            {/* Status */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Status</span>
                                    <select
                                        value={form.status}
                                        onChange={handleChange('status')}
                                        style={{ ...inputStyle, background: '#ffffff' }}
                                    >
                                        <option value="">Select a status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Contracted">Contracted</option>
                                    </select>
                                </label>
                            </div>

                            {/* Project */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Project</span>
                                    <select
                                        value={form.projectId}
                                        onChange={handleChange('projectId')}
                                        style={{ ...inputStyle, background: '#ffffff' }}
                                    >
                                        <option value="">Select a project</option>
                                        {projects.map(p => (
                                            <option key={p.project_id} value={p.project_id}>{p.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {/* Date Meet */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Date Meet</span>
                                    <input
                                        type="date"
                                        value={form.dateMeet}
                                        onChange={handleChange('dateMeet')}
                                        style={inputStyle}
                                    />
                                </label>
                            </div>

                            {/* Outcome */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Outcome</span>
                                    <input
                                        type="text"
                                        value={form.outcome}
                                        onChange={handleChange('outcome')}
                                        style={inputStyle}
                                        placeholder="e.g. Contract signed"
                                    />
                                </label>
                            </div>

                            {/* Additional Info / Notes */}
                            <div>
                                <label style={{ display: 'block' }}>
                                    <span style={labelStyle}>Notes</span>
                                    <textarea
                                        value={form.additionalInfo}
                                        onChange={handleChange('additionalInfo')}
                                        rows={4}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        placeholder="Additional notes about this vendor..."
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/vendors')}
                                disabled={loading}
                                style={{
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    background: '#ffffff',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Poppins',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    borderRadius: '6px',
                                    background: loading ? '#9ca3af' : '#FF5900',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#ffffff',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Poppins',
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Vendor'}
                            </button>
                        </div>

                        {/* Status Message */}
                        {message && (
                            <div style={{
                                marginTop: '16px',
                                borderRadius: '6px',
                                padding: '16px',
                                background: message.includes('success') ? '#f0fdf4' : '#fef2f2',
                                color: message.includes('success') ? '#166534' : '#991b1b',
                                fontFamily: 'Poppins',
                            }}>
                                {message}
                            </div>
                        )}
                    </form>
                </main>
            </div>
        </div>
    );
}
