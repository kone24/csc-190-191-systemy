'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    role: 'Administrator' | 'Manager' | 'User';
    avatar?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    token: string | null;
    setToken: (token: string | null) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    isManager: boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Backwards-compatible alias used by some pages/components
export const useAuth = useUser;

interface UserProviderProps {
    children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const originalFetch = window.fetch.bind(window);

        const readCookie = (name: string) => {
            const cookie = document.cookie
                .split('; ')
                .find((entry) => entry.startsWith(`${name}=`));
            if (!cookie) return '';
            return decodeURIComponent(cookie.slice(name.length + 1));
        };

        window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
            const requestUrl =
                typeof input === 'string'
                    ? input
                    : input instanceof URL
                        ? input.toString()
                        : input.url;

            const requestMethod = (
                init?.method ??
                (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')
            ).toUpperCase();

            const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(requestMethod);
            const isBackendRequest =
                requestUrl.startsWith(backendUrl) ||
                requestUrl.startsWith('http://localhost:3001') ||
                requestUrl.startsWith('https://systemy-backend-916103566644.us-east1.run.app');

            if (!isStateChanging || !isBackendRequest) {
                return originalFetch(input, init);
            }

            const csrfToken = readCookie('csrf_token');
            if (!csrfToken) {
                return originalFetch(input, init);
            }

            const combinedHeaders = new Headers(
                init?.headers ??
                (typeof input !== 'string' && !(input instanceof URL) ? input.headers : undefined),
            );

            if (!combinedHeaders.has('x-csrf-token')) {
                combinedHeaders.set('x-csrf-token', csrfToken);
            }

            return originalFetch(input, {
                ...init,
                headers: combinedHeaders,
            });
        }) as typeof fetch;

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    // Allow setting a bearer token (SPA flow). When a token is set we fetch the user
    // profile using Authorization header and populate context accordingly.
    const setToken = async (t: string | null) => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        setTokenState(t);
        if (!t) {
            setUser(null);
            return;
        }
        try {
            const res = await fetch(`${backendUrl}/auth/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${t}` },
            });
            if (!res.ok) throw new Error('Invalid token');
            const data = await res.json();
            if (data.ok && data.user) {
                const nameParts = (data.user.name || '').split(' ');
                const roleMap: Record<string, 'Administrator' | 'Manager' | 'User'> = {
                    admin: 'Administrator',
                    manager: 'Manager',
                    staff: 'User',
                };
                const mappedUser: User = {
                    id: data.user.user_id,
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: data.user.email,
                    company: 'Headword Inc.',
                    phone: '',
                    role: roleMap[data.user.role] || 'User',
                    avatar: data.user.avatar || undefined,
                };
                setUser(mappedUser);
                localStorage.setItem('user', JSON.stringify(mappedUser));
            } else {
                throw new Error('No user in response');
            }
        } catch {
            setUser(null);
            setTokenState(null);
            localStorage.removeItem('user');
        }
    };

    // Initialize user: handle URL fragment token, then check sessionStorage, then cookie session.
    useEffect(() => {
        // 1) If the OAuth redirect provided a token in the URL fragment (e.g. #token=...)
        // consume it first so we can persist and populate the user immediately.
        try {
            if (typeof window !== 'undefined' && window.location.hash) {
                const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                const tokenFromHash = hash.get('token');
                if (tokenFromHash) {
                    try { sessionStorage.setItem('access_token', tokenFromHash); } catch { }
                    // Clean the fragment from the URL
                    window.history.replaceState({}, '', window.location.pathname + window.location.search);
                    // populate user from token, navigate to dashboard, and finish loading
                    setToken(tokenFromHash).then(() => router.replace('/dashboard')).finally(() => setIsLoading(false));
                    return;
                }
            }
        } catch (e) {
            // ignore parsing errors and continue to other initialization flows
        }

        // 2) Next, check sessionStorage for a saved bearer token (SPA flow).
        const saved = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
        if (saved) {
            // populate user from token
            setToken(saved).finally(() => setIsLoading(false));
            return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

        // Fallback to cookie session when no bearer token exists.
        fetch(`${backendUrl}/auth/me`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then((data: { ok: boolean; user?: { user_id: string; name: string; email: string; role: string; avatar?: string } }) => {
                if (data.ok && data.user) {
                    const nameParts = (data.user.name || '').split(' ');
                    const roleMap: Record<string, 'Administrator' | 'Manager' | 'User'> = {
                        admin: 'Administrator',
                        manager: 'Manager',
                        staff: 'User',
                    };
                    const mappedUser: User = {
                        id: data.user.user_id,
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || '',
                        email: data.user.email,
                        company: 'Headword Inc.',
                        phone: '',
                        role: roleMap[data.user.role] || 'User',
                        avatar: data.user.avatar || undefined,
                    };
                    setUser(mappedUser);
                    localStorage.setItem('user', JSON.stringify(mappedUser));
                } else {
                    throw new Error('No user in response');
                }
            })
            .catch(() => {
                // No valid session cookie — clear stored user
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);


    // Update localStorage when user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const logout = async () => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            await fetch(`${backendUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch {
            // ignore network errors — still clear local state
        }
        setUser(null);
        setTokenState(null);
        localStorage.removeItem('user');
        // Use soft navigation so UserContext stays mounted with user=null.
        // This prevents /auth/me from being re-fetched and bouncing the user back.
        router.replace('/login');
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'Administrator';
    const isManager = user?.role === 'Manager' || isAdmin;

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                token,
                setToken,
                isAuthenticated,
                isLoading,
                isAdmin,
                isManager,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};