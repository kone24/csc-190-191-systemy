'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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

  const [client, setClient]     = useState<ClientData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  const [tags, setTags]         = useState<Tag[]>([]);
  const [newName, setNewName]   = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
              <div style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: '600', color: 'black', marginBottom: 8 }}>
                {client.first_name} {client.last_name}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {[client.business_name, client.title, client.email, client.phone_number, client.industry].filter(Boolean).map((v, i) => (
                  <span key={i} style={{ fontFamily: 'Poppins', fontSize: 14, color: 'rgba(0,0,0,0.60)' }}>{v}</span>
                ))}
              </div>
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
    </div>
  );
}
