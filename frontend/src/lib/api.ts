export async function apiFetch(token: string | null, path: string, init: RequestInit = {}) {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${base}${path}`, { ...init, headers, credentials: undefined });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
