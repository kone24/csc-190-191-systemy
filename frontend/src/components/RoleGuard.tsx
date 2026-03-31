'use client';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type AppRole = 'admin' | 'manager' | 'staff';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallback,
    redirectTo
}) => {
    
    const { user, isAuthenticated, loading} = useUser();
    const router = useRouter();
    console.log("RoleGuard user:", user);
    
    useEffect(() => {
        if (!loading && !isAuthenticated && redirectTo) {
            router.push(redirectTo);
        }
    }, [loading, isAuthenticated, redirectTo, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

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
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
        {children}
    </RoleGuard>
);

export const ManagerAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => (
    <RoleGuard allowedRoles={['admin', 'manager']} fallback={fallback}>
        {children}
    </RoleGuard>
);

// Hook to check permissions in components
export const usePermissions = () => {
    const { user } = useUser();

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager' || user?.role === 'admin';
    
    const hasRole = (role: AppRole) => user?.role === role;
    const hasAnyRole = (roles: AppRole[]) => !!user && roles.includes(user.role);

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