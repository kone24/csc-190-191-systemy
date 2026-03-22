'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

//  Tag encoding 
const DEFAULT_COLOR = '#8A38F5';

const PALETTE = [
  '#8A38F5', // purple 
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
];

interface Tag { name: string; color: string; }

function parseTag(raw: string): Tag {
  const sep = raw.lastIndexOf('|#');
  if (sep !== -1) return { name: raw.slice(0, sep), color: raw.slice(sep + 1) };
  return { name: raw, color: DEFAULT_COLOR };
}

function serializeTag(t: Tag): string {
  return `${t.name}|${t.color}`;
}

// UI component for a single tag pill, with optional remove button
function TagPill({ tag, onRemove }: { tag: Tag; onRemove?: () => void }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 35,
      paddingLeft: 29,
      paddingRight: onRemove ? 12 : 29,
      borderRadius: 20,
      background: tag.color,
      color: 'white',
      fontSize: 12,
      fontFamily: 'Poppins',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      gap: 6,
    }}>
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${tag.name}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            borderRadius: '50%',
            width: 16,
            height: 16,
            color: 'white',
            fontSize: 11,
            fontFamily: 'Poppins',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

// Client data shape based on backend API
interface ClientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  title?: string;
  industry?: string;
  website?: string;
  additional_info?: string;
  tags?: string[];
}

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [client, setClient] = useState<ClientData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch client
  useEffect(() => {
    fetch(`http://localhost:3001/clients/${id}`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
      .then(data => {
        if (!data.client) throw new Error('Unexpected response shape');
        const c: ClientData = data.client;
        setClient(c);
        setTags((c.tags ?? []).map(parseTag));
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Persist tag array to backend
  const persist = async (next: Tag[]) => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`http://localhost:3001/clients/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: next.map(serializeTag) }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } catch (err: any) {
      console.error('Failed to save tags:', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const name = newName.trim();
    if (!name || tags.length >= 3) return;
    const next = [...tags, { name, color: newColor }];
    setTags(next);
    persist(next);
    setNewName('');
    inputRef.current?.focus();
  };

  const removeTag = (i: number) => {
    const next = tags.filter((_, idx) => idx !== i);
    setTags(next);
    persist(next);
  };

  const startEditing = () => {
    if (!client) return;
    setEditForm({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone_number: client.phone_number,
      business_name: client.business_name,
      title: client.title || '',
      industry: client.industry || '',
      website: client.website || '',
      additional_info: client.additional_info || '',
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
      const res = await fetch(`http://localhost:3001/clients/${id}`, {
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
      setClient(data.client);
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const editField = (field: keyof ClientData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`http://localhost:3001/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      router.push('/dashboard/clients');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // UI LOOK
  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
      <Sidebar activePage="clients" />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(217, 217, 217, 0.15)',
        padding: '20px 20px 20px 30px',
        gap: '20px',
      }}>

        {/* Back */}
        <Link href="/dashboard/clients" style={{
          color: 'rgba(255, 89, 0, 0.80)',
          fontFamily: 'Poppins',
          fontSize: 14,
          fontWeight: '500',
          textDecoration: 'none',
        }}>
          ← Back to Contacts
        </Link>

        {loading && <p style={{ fontFamily: 'Poppins', fontSize: 14, color: '#FF5900' }}>Loading…</p>}
        {fetchError && (
          <p style={{ fontFamily: 'Poppins', fontSize: 14, color: '#ef4444', background: '#fef2f2', borderRadius: 10, padding: 10 }}>
            {fetchError}
          </p>
        )}

        {client && (
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
                      {client.first_name} {client.last_name}
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
                    {[client.business_name, client.title, client.email, client.phone_number, client.industry].filter(Boolean).map((v, i) => (
                      <span key={i} style={{ fontFamily: 'Poppins', fontSize: 14, color: 'rgba(0,0,0,0.60)' }}>{v}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: 16 }}>
                    Edit Contact
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {([
                      ['first_name', 'First Name'],
                      ['last_name', 'Last Name'],
                      ['email', 'Email'],
                      ['phone_number', 'Phone'],
                      ['business_name', 'Company'],
                      ['title', 'Title'],
                      ['industry', 'Industry'],
                      ['website', 'Website'],
                    ] as const).map(([field, label]) => (
                      <div key={field}>
                        <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>
                          {label}
                        </label>
                        <input
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

            {/* Tags card */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              padding: '24px 30px',
            }}>
              <div style={{
                fontFamily: 'Poppins', fontSize: 18, fontWeight: '600',
                color: 'rgba(255, 89, 0, 0.80)', marginBottom: 20,
              }}>
                Tags
              </div>

              {/* Existing pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 35, marginBottom: 24 }}>
                {tags.length === 0
                  ? <span style={{ fontFamily: 'Poppins', fontSize: 14, color: 'rgba(0,0,0,0.35)' }}>No tags yet.</span>
                  : tags.map((tag, i) => <TagPill key={i} tag={tag} onRemove={() => removeTag(i)} />)
                }
              </div>

              {/* Add tag controls — hidden once limit is reached */}
              {tags.length >= 3 && (
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'rgba(0,0,0,0.40)', marginBottom: 8 }}>
                  Maximum of 3 tags reached.
                </p>
              )}
              <div style={{ display: tags.length >= 3 ? 'none' : 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Row 1: swatches + input + preview */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  {PALETTE.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      aria-label={`Color ${c}`}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: c, padding: 0, cursor: 'pointer',
                        border: newColor === c ? '2px solid #000' : '2px solid transparent',
                        outline: 'none',
                      }}
                    />
                  ))}

                  <input
                    ref={inputRef}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="Tag name…"
                    style={{
                      height: 35, padding: '0 14px', borderRadius: 20,
                      border: '1.5px solid rgba(0,0,0,0.20)',
                      fontFamily: 'Poppins', fontSize: 13, color: 'black',
                      outline: 'none', width: 160, background: 'white',
                    }}
                  />

                  {newName.trim() && <TagPill tag={{ name: newName.trim(), color: newColor }} />}
                </div>

                {/* Row 2: Add button */}
                <div>
                  <button
                    onClick={addTag}
                    disabled={!newName.trim() || saving}
                    style={{
                      height: 35, padding: '0 20px', borderRadius: 20,
                      background: newName.trim() && !saving ? '#FF5900' : 'rgba(0,0,0,0.12)',
                      color: 'white', border: 'none',
                      fontFamily: 'Poppins', fontSize: 13, fontWeight: '600',
                      cursor: newName.trim() && !saving ? 'pointer' : 'default',
                      transition: 'background 200ms ease',
                    }}
                  >
                    {saving ? 'Saving…' : 'Add Tag'}
                  </button>
                </div>
              </div>

              {saveError && (
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: '#ef4444', marginTop: 12 }}>
                  Failed to save: {saveError}
                </p>
              )}
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
              Delete Contact
            </div>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.60)', margin: '0 0 24px' }}>
              Are you sure you want to delete this contact? This action cannot be undone.
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
