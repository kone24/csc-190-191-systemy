'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/app/supabase';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    role: 'admin' | 'manager' | 'staff';
    teamId?: string;
    avatar?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isManager: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
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

    const refreshUser = async () => {

        setLoading(true);

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? null;

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
        const res = await fetch('http://localhost:3001/auth/myUser', {
            headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        console.log("auth/myUser status:", res.status);

            if (!res.ok) {
                setUser(null);
                setLoading(false);
                return;
            }

            const me = await res.json();
            console.log("auth/myUser payload:", me);

            const mappedUser: User = {
                id: me.user_id,
                firstName: me.name?.split(' ')[0] || '',
                lastName: me.name?.split(' ').slice(1).join(' ') || '',
                email: me.email,
                company: me.company || '',
                phone: me.phone || '',
                role: me.role,
                teamId: me.team_id,
                avatar: me.avatar || '',
            };

            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            console.log("Loaded app user:", mappedUser);
            console.log("Supabase session token exists?", !!token);
        } catch (error) {
        console.error('Error loading authenticated user:', error);
        setUser(null);
        localStorage.removeItem('user');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();

        const {
        data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
        refreshUser();
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const isAuthenticated = !!user;
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
            loading,
            refreshUser,
            logout,
        }}
        >
            {children}
        </UserContext.Provider>
    );
}