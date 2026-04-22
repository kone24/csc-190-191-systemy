'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    // Once the auth fetch completes (isLoading = false), redirect if not authenticated.
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    // Show spinner while UserContext is fetching /auth/me
    if (isLoading || !user) {
        return (
            <div style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #f0f0f0',
                    borderTop: '3px solid #FF5900',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return <>{children}</>;
}
