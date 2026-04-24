// /src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/UserContext';

export default function AuthCallback() {
    const router = useRouter();
    const { setToken } = useAuth();
    useEffect(() => {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const token = hash.get('token');
        if (token) {
            setToken(token); // store in memory (context)
            // persist for this tab/session so reloads keep the session
            try { sessionStorage.setItem('access_token', token); } catch { }
            window.history.replaceState({}, '', '/'); // clean URL
            router.replace('/dashboard');
        } else {
            navigate('/login?error=oauth');
        }
    }, []);
    return null;
}