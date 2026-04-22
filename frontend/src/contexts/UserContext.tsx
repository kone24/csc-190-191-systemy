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

interface UserProviderProps {
    children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize user: try fetching from backend (cookie-based auth), fall back to localStorage
    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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