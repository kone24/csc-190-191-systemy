'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface VendorData {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  company?: string;
  business_name?: string;
  status?: string;
  project_id?: string;
  date_meet?: string;
  outcome?: string;
  additional_info?: string;
  project?: { project_id: string; name: string };
}

// Shared card style
const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 20,
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  padding: '24px 30px',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 18,
  fontWeight: '600',
  color: 'rgba(255, 89, 0, 0.80)',
  marginBottom: 20,
};

const fieldLabel: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 13,
  fontWeight: '600',
  color: 'rgba(0, 0, 0, 0.45)',
  marginBottom: 4,
};

const fieldValue: React.CSSProperties = {
  fontFamily: 'Poppins',
  fontSize: 15,
  fontWeight: '500',
  color: 'black',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={fieldLabel}>{label}</div>
      <div style={fieldValue}>{value?.trim() ? value : '—'}</div>
    </div>
  );
}

export default function VendorProfilePage() {
  const id = useParams<{ id: string }>()?.id ?? '';
  const router = useRouter();

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VendorData>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch vendor
  useEffect(() => {
    fetch(`http://localhost:3001/vendors/${id}`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
      .then(data => {
        if (!data.vendor) throw new Error('Unexpected response shape');
        setVendor(data.vendor);
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);


  const startEditing = () => {
    if (!vendor) return;
    setEditForm({
      first_name: vendor.first_name,
      last_name: vendor.last_name ?? '',
      email: vendor.email ?? '',
      company: vendor.company ?? vendor.business_name ?? '',
      status: vendor.status ?? '',
      date_meet: vendor.date_meet ?? '',
      outcome: vendor.outcome ?? '',
      additional_info: vendor.additional_info ?? '',
    });
    setEditError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm({});
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editForm.first_name?.trim()) {
      setEditError('First name is required');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      // Strip null/undefined/empty-string values so @IsOptional() validators skip them
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(editForm)) {
        if (val !== null && val !== undefined && val !== '') {
          cleaned[key] = val;
        }
      }
      const res = await fetch(`http://localhost:3001/vendors/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaned),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || `Error ${res.status}`;
        throw new Error(msg);
      }
      const data = await res.json();
      setVendor(data.vendor);
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const editField = (field: keyof VendorData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`http://localhost:3001/vendors/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      router.push('/dashboard/vendors');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // UI
  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
      <Sidebar activePage="vendors" />

      <div style={{
        flex: 1,
        minWidth: 0,
        marginLeft: 320,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(217, 217, 217, 0.15)',
        padding: '20px 20px 20px 30px',
        gap: '20px',
      }}>

        {/* Back */}
        <Link href="/dashboard/vendors" style={{
          color: 'rgba(255, 89, 0, 0.80)',
          fontFamily: 'Poppins',
          fontSize: 14,
          fontWeight: '500',
          textDecoration: 'none',
        }}>
          ← Back to Vendors
        </Link>

        {loading && <p style={{ fontFamily: 'Poppins', fontSize: 14, color: '#FF5900' }}>Loading…</p>}
        {fetchError && (
          <p style={{ fontFamily: 'Poppins', fontSize: 14, color: '#ef4444', background: '#fef2f2', borderRadius: 10, padding: 10 }}>
            {fetchError}
          </p>
        )}

        {vendor && (
          <>
            {/* Header card */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              padding: '24px 30px',
            }}>
              {!editing ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: '600', color: 'black', marginBottom: 8 }}>
                      {vendor.first_name} {vendor.last_name}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={startEditing}
                        style={{
                          background: '#FF5900',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 20px',
                          fontSize: 14,
                          fontFamily: 'Poppins',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 20px',
                          fontSize: 14,
                          fontFamily: 'Poppins',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    {[vendor.company || vendor.business_name, vendor.email, vendor.status, vendor.project?.name].filter(Boolean).map((v, i) => (
                      <span key={i} style={{ fontFamily: 'Poppins', fontSize: 14, color: 'rgba(0,0,0,0.60)' }}>{v}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: 16 }}>
                    Edit Vendor
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {([
                      ['first_name', 'First Name'],
                      ['last_name', 'Last Name'],
                      ['email', 'Email'],
                      ['company', 'Company'],
                      ['status', 'Status'],
                      ['date_meet', 'Date Meet'],
                      ['outcome', 'Outcome'],
                    ] as const).map(([field, label]) => (
                      <div key={field}>
                        <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>
                          {label}
                        </label>
                        <input
                          type={field === 'date_meet' ? 'date' : field === 'email' ? 'email' : 'text'}
                          value={(editForm as any)[field] ?? ''}
                          onChange={(e) => editField(field, e.target.value)}
                          style={{
                            width: '100%',
                            height: 38,
                            padding: '0 12px',
                            borderRadius: 8,
                            border: '1.5px solid rgba(0,0,0,0.15)',
                            fontFamily: 'Poppins',
                            fontSize: 14,
                            color: 'black',
                            outline: 'none',
                            background: 'white',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>
                      Notes
                    </label>
                    <textarea
                      value={editForm.additional_info ?? ''}
                      onChange={(e) => editField('additional_info', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1.5px solid rgba(0,0,0,0.15)',
                        fontFamily: 'Poppins',
                        fontSize: 14,
                        color: 'black',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {editError && (
                    <p style={{ fontFamily: 'Poppins', fontSize: 13, color: '#ef4444', marginTop: 8 }}>
                      {editError}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button
                      onClick={saveEdit}
                      disabled={editSaving}
                      style={{
                        background: editSaving ? 'rgba(0,0,0,0.12)' : '#FF5900',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 24px',
                        fontSize: 14,
                        fontFamily: 'Poppins',
                        fontWeight: '500',
                        cursor: editSaving ? 'default' : 'pointer',
                      }}
                    >
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={editSaving}
                      style={{
                        background: 'transparent',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: '8px 24px',
                        fontSize: 14,
                        fontFamily: 'Poppins',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Vendor Details card */}
            <div style={cardStyle}>
              <div style={sectionTitle}>Vendor Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 32px' }}>
                <Field label="Company" value={vendor.company || vendor.business_name} />
                <Field label="Status" value={vendor.status} />
                <Field label="Project" value={vendor.project?.name} />
                <Field label="Date Meet" value={vendor.date_meet} />
                <Field label="Outcome" value={vendor.outcome} />
                <Field label="Email" value={vendor.email} />
              </div>
            </div>

            {/* Notes */}
            <div style={cardStyle}>
              <div style={sectionTitle}>Notes</div>
              <div style={{
                fontFamily: 'Poppins',
                fontSize: 14,
                color: vendor.additional_info?.trim() ? 'black' : 'rgba(0,0,0,0.35)',
                background: 'rgba(217, 217, 217, 0.15)',
                borderRadius: 12,
                padding: '16px 20px',
                minHeight: 80,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {vendor.additional_info?.trim() || '—'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          onClick={() => !deleting && setShowDeleteModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '32px 36px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              maxWidth: 400,
              width: '90%',
              fontFamily: 'Poppins',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 12 }}>
              Delete Vendor
            </div>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.60)', margin: '0 0 24px' }}>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </p>
            {deleteError && (
              <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 16 }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: '8px 24px',
                  fontSize: 14,
                  fontFamily: 'Poppins',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: deleting ? 'rgba(0,0,0,0.12)' : '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 24px',
                  fontSize: 14,
                  fontFamily: 'Poppins',
                  fontWeight: '500',
                  cursor: deleting ? 'default' : 'pointer',
                }}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
