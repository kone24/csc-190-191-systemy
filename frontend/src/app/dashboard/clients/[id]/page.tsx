'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Select from 'react-select';
import Sidebar from '@/components/Sidebar';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { COUNTRIES, STATES_BY_COUNTRY } from '@/constants/location-data';
import type { Country, State } from '@/types/location';

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
  relationship_owner?: string;
  status?: string;
  contact_medium?: string;
  date_of_contact?: string;
  where_met?: string;
  chat_summary?: string;
  outcome?: string;
  relationship_status?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    additional_info?: string;
  };
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [client, setClient]     = useState<Client | null>(null);
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

  const [selectedEditCountry, setSelectedEditCountry] = useState<Country | null>(null);
  const availableEditStates = useMemo(
    () => (selectedEditCountry ? STATES_BY_COUNTRY[selectedEditCountry.code] || [] : []),
    [selectedEditCountry],
  );

  // Fetch client
  useEffect(() => {
    fetch(`http://localhost:3001/clients/${id}`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
      .then(data => {
        if (!data.client) throw new Error('Unexpected response shape');
        const c: Client = data.client;
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
    const matchedCountry = COUNTRIES.find(c => c.name === client.address?.country) ?? null;
    setSelectedEditCountry(matchedCountry);
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
      relationship_owner: client.relationship_owner || '',
      status: client.status || '',
      contact_medium: client.contact_medium || '',
      date_of_contact: client.date_of_contact || '',
      where_met: client.where_met || '',
      chat_summary: client.chat_summary || '',
      outcome: client.outcome || '',
      relationship_status: client.relationship_status || '',
      address: {
        street: client.address?.street || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        zip_code: client.address?.zip_code || '',
        country: client.address?.country || '',
        additional_info: client.address?.additional_info || '',
      },
      social_links: {
        linkedin: client.social_links?.linkedin || '',
        twitter: client.social_links?.twitter || '',
        facebook: client.social_links?.facebook || '',
        instagram: client.social_links?.instagram || '',
      },
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

  const editAddressField = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, address: { ...(prev.address ?? {}), [field]: value } }));
  };

  const editSocialField = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, social_links: { ...(prev.social_links ?? {}), [field]: value } }));
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
                    {[client.company || client.business_name, client.title, client.email, client.phone_number, client.industry].filter(Boolean).map((v, i) => (
                      <span key={i} style={{ fontFamily: 'Poppins', fontSize: 14, color: 'rgba(0,0,0,0.60)' }}>{v}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: '600', color: 'rgba(255, 89, 0, 0.80)', marginBottom: 20 }}>
                    Edit Contact
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>
                          First Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          value={editForm.first_name ?? ''}
                          onChange={(e) => editField('first_name', e.target.value)}
                          placeholder="John"
                          style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Last Name</label>
                        <input
                          value={editForm.last_name ?? ''}
                          onChange={(e) => editField('last_name', e.target.value)}
                          placeholder="Doe"
                          style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Email</label>
                      <input
                        type="email"
                        value={editForm.email ?? ''}
                        onChange={(e) => editField('email', e.target.value)}
                        placeholder="john@example.com"
                        style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Phone</label>
                      <PhoneNumberInput
                        value={editForm.phone_number ?? ''}
                        onChange={(value) => editField('phone_number', value || '')}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Company</label>
                        <input
                          value={editForm.business_name ?? ''}
                          onChange={(e) => editField('business_name', e.target.value)}
                          placeholder="Company Name"
                          style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Title</label>
                        <input
                          value={editForm.title ?? ''}
                          onChange={(e) => editField('title', e.target.value)}
                          placeholder="e.g. VP of Engineering"
                          style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* CRM Details */}
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 16, marginTop: 4 }}>
                      <div style={{ fontFamily: 'Poppins', fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.35)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CRM Details</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Relationship Owner</label>
                            <input
                              value={editForm.relationship_owner ?? ''}
                              onChange={(e) => editField('relationship_owner', e.target.value)}
                              placeholder="Team member managing this contact"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Status</label>
                            <input
                              value={editForm.status ?? ''}
                              onChange={(e) => editField('status', e.target.value)}
                              placeholder="e.g. Active, Inactive"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Contact Medium</label>
                            <select
                              value={editForm.contact_medium ?? ''}
                              onChange={(e) => editField('contact_medium', e.target.value)}
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            >
                              <option value="">Select a contact medium</option>
                              <option value="Email">Email</option>
                              <option value="Phone">Phone</option>
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="DM">DM</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Date of Contact</label>
                            <input
                              type="date"
                              value={editForm.date_of_contact ?? ''}
                              onChange={(e) => editField('date_of_contact', e.target.value)}
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Where Met</label>
                            <input
                              value={editForm.where_met ?? ''}
                              onChange={(e) => editField('where_met', e.target.value)}
                              placeholder="e.g. Tech Conference 2026"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Outcome</label>
                            <input
                              value={editForm.outcome ?? ''}
                              onChange={(e) => editField('outcome', e.target.value)}
                              placeholder="e.g. Follow-up scheduled"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Relationship Status</label>
                            <input
                              value={editForm.relationship_status ?? ''}
                              onChange={(e) => editField('relationship_status', e.target.value)}
                              placeholder="e.g. Warm, Cold, Hot"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Chat Summary</label>
                          <textarea
                            value={editForm.chat_summary ?? ''}
                            onChange={(e) => editField('chat_summary', e.target.value)}
                            rows={3}
                            placeholder="Summary of what was discussed..."
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                          />
                        </div>

                      </div>
                    </div>

                    {/* Address */}
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 16, marginTop: 4 }}>
                      <div style={{ fontFamily: 'Poppins', fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.35)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Address</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Street</label>
                            <input
                              value={editForm.address?.street ?? ''}
                              onChange={(e) => editAddressField('street', e.target.value)}
                              placeholder="123 Main St"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>City</label>
                            <input
                              value={editForm.address?.city ?? ''}
                              onChange={(e) => editAddressField('city', e.target.value)}
                              placeholder="City"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Country</label>
                            <Select<Country>
                              instanceId="edit-country"
                              options={COUNTRIES}
                              value={selectedEditCountry}
                              onChange={(selected) => {
                                setSelectedEditCountry(selected);
                                setEditForm(prev => ({
                                  ...prev,
                                  address: { ...(prev.address ?? {}), country: selected?.name ?? '', state: '' },
                                }));
                              }}
                              getOptionLabel={(o) => o.name}
                              getOptionValue={(o) => o.code}
                              placeholder="Select a country"
                              styles={{
                                control: (base: any) => ({ ...base, borderRadius: 8, borderColor: 'rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, minHeight: 38 }),
                                menu: (base: any) => ({ ...base, fontFamily: 'Poppins', fontSize: 14 }),
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>State / Province</label>
                            <Select<State>
                              instanceId="edit-state"
                              options={availableEditStates}
                              value={availableEditStates.find(s => s.name === editForm.address?.state) ?? null}
                              onChange={(selected) => editAddressField('state', selected?.name ?? '')}
                              getOptionLabel={(o) => o.name}
                              getOptionValue={(o) => o.code}
                              placeholder="Select a state"
                              isDisabled={!selectedEditCountry}
                              styles={{
                                control: (base: any, state: any) => ({ ...base, borderRadius: 8, borderColor: 'rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, minHeight: 38, opacity: state.isDisabled ? 0.5 : 1 }),
                                menu: (base: any) => ({ ...base, fontFamily: 'Poppins', fontSize: 14 }),
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Postal Code</label>
                            <input
                              value={editForm.address?.zip_code ?? ''}
                              onChange={(e) => editAddressField('zip_code', e.target.value)}
                              placeholder="Postal Code"
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Additional Info</label>
                            <input
                              value={editForm.address?.additional_info ?? ''}
                              onChange={(e) => editAddressField('additional_info', e.target.value)}
                              placeholder="Apt, suite, etc."
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Social Links */}
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 16, marginTop: 4 }}>
                      <div style={{ fontFamily: 'Poppins', fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.35)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Social Links</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>LinkedIn</label>
                          <input
                            type="url"
                            value={editForm.social_links?.linkedin ?? ''}
                            onChange={(e) => editSocialField('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Twitter</label>
                          <input
                            type="url"
                            value={editForm.social_links?.twitter ?? ''}
                            onChange={(e) => editSocialField('twitter', e.target.value)}
                            placeholder="https://twitter.com/username"
                            style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Facebook</label>
                          <input
                            type="url"
                            value={editForm.social_links?.facebook ?? ''}
                            onChange={(e) => editSocialField('facebook', e.target.value)}
                            placeholder="https://facebook.com/username"
                            style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Instagram</label>
                          <input
                            type="url"
                            value={editForm.social_links?.instagram ?? ''}
                            onChange={(e) => editSocialField('instagram', e.target.value)}
                            placeholder="https://instagram.com/username"
                            style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 16, marginTop: 4 }}>
                      <label style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(0,0,0,0.50)', marginBottom: 4, display: 'block' }}>Notes</label>
                      <textarea
                        value={editForm.additional_info ?? ''}
                        onChange={(e) => editField('additional_info', e.target.value)}
                        rows={4}
                        placeholder="Additional notes about the contact..."
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.15)', fontFamily: 'Poppins', fontSize: 14, color: 'black', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>

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

            {/* CRM Info */}
            <div style={cardStyle}>
              <div style={sectionTitle}>CRM Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 32px' }}>
                <Field label="Company" value={client.company || client.business_name} />
                <Field label="Title" value={client.title} />
                <Field label="Relationship Owner" value={client.relationship_owner} />
                <Field label="Status" value={client.status} />
                <Field label="Contact Medium" value={client.contact_medium} />
                <Field label="Date of Contact" value={client.date_of_contact} />
                <Field label="Relationship Status" value={client.relationship_status} />
              </div>
            </div>

            {/* Interaction Details */}
            <div style={cardStyle}>
              <div style={sectionTitle}>Interaction Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 32px' }}>
                <Field label="Where Met" value={client.where_met} />
                <Field label="Chat Summary" value={client.chat_summary} />
                <Field label="Outcome" value={client.outcome} />
              </div>
            </div>

            {/* Address */}
            <div style={cardStyle}>
              <div style={sectionTitle}>Address</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 32px' }}>
                <Field label="Street" value={client.address?.street} />
                <Field label="City" value={client.address?.city} />
                <Field label="State" value={client.address?.state} />
                <Field label="Country" value={client.address?.country} />
                <Field label="Postal Code" value={client.address?.zip_code} />
                <Field label="Additional Info" value={client.address?.additional_info} />
              </div>
            </div>

            {/* Social Links */}
            <div style={cardStyle}>
              <div style={sectionTitle}>Social Links</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 32px' }}>
                <Field label="LinkedIn" value={client.social_links?.linkedin} />
                <Field label="Twitter" value={client.social_links?.twitter} />
                <Field label="Facebook" value={client.social_links?.facebook} />
                <Field label="Instagram" value={client.social_links?.instagram} />
                <Field label="Website" value={client.website} />
              </div>
            </div>

            {/* Notes */}
            <div style={cardStyle}>
              <div style={sectionTitle}>Notes</div>
              <div style={{
                fontFamily: 'Poppins',
                fontSize: 14,
                color: client.notes?.trim() ? 'black' : 'rgba(0,0,0,0.35)',
                background: 'rgba(217, 217, 217, 0.15)',
                borderRadius: 12,
                padding: '16px 20px',
                minHeight: 80,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {client.notes?.trim() || '—'}
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
