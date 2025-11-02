// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';

export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl">Loading...</div>
        </div>
    );
}