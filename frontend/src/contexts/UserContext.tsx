'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

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

    // Initialize user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        } else {
            // For demo purposes, set a default user
            // Change role here to test different user types:
            // 'Administrator' | 'Manager' | 'User'
            // This part will be update later when we have the database and authentication flow in place
            const defaultUser: User = {
                id: '1',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@headword.com',
                company: 'Headword Inc.',
                phone: '+1 (555) 123-4567',
                role: 'Administrator' // <-- Default to admin, use switcher to test other roles
            };
            setUser(defaultUser);
            localStorage.setItem('user', JSON.stringify(defaultUser));
        }
    }, []);

    // Update localStorage when user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
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
                isAdmin,
                isManager,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};