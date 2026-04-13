'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    user_id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
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
    const [loading, setLoading] = useState(true);

    // Fetch the real user from the backend on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
                    { credentials: 'include' },
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.ok && data.user) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const logout = () => {
        setUser(null);
        window.location.href = '/login';
    };

    const isAuthenticated = !loading && !!user;
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager' || isAdmin;

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated,
                isAdmin,
                isManager,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};