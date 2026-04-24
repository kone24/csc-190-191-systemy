import React from 'react';
import type { AppProps } from 'next/app';
import { UserProvider } from '@/contexts/UserContext';
import '@/app/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    );
}
