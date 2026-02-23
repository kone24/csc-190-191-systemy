'use client';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('Administrator' | 'Manager' | 'User')[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallback,
    redirectTo
}) => {
    const { user, isAuthenticated } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated && redirectTo) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, redirectTo, router]);

    if (!isAuthenticated) {
        return fallback || (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Please log in to access this page.
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return fallback || (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                }}>
                    🚫
                </div>
                <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#333'
                }}>
                    Access Denied
                </div>
                <div style={{
                    fontSize: '16px',
                    color: '#666',
                    maxWidth: '400px'
                }}>
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </div>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#FF5900',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

// Helper components for specific roles
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => (
    <RoleGuard allowedRoles={['Administrator']} fallback={fallback}>
        {children}
    </RoleGuard>
);

export const ManagerAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => (
    <RoleGuard allowedRoles={['Administrator', 'Manager']} fallback={fallback}>
        {children}
    </RoleGuard>
);

// Hook to check permissions in components
export const usePermissions = () => {
    const { user, isAdmin, isManager } = useUser();
    
    const hasRole = (role: 'Administrator' | 'Manager' | 'User') => {
        return user?.role === role;
    };

    const hasAnyRole = (roles: ('Administrator' | 'Manager' | 'User')[]) => {
        return user ? roles.includes(user.role) : false;
    };

    return {
        isAdmin,
        isManager,
        hasRole,
        hasAnyRole,
        canManageUsers: isAdmin,
        canViewReports: isManager,
        canManageProjects: isManager
    };
};