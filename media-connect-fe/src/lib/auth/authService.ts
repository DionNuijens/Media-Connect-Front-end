// src/lib/auth/authService.ts
import { LoginCredentials, AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    },

    // UPDATED: Use /api/user/me instead of /auth/me
    getCurrentUser: async (token: string) => {
        console.log('📡 Fetching user from /api/user/me with token');

        const response = await fetch(`${API_URL}/api/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('❌ Failed to fetch user:', response.status, response.statusText);
            throw new Error('Failed to get user');
        }

        const userData = await response.json();
        console.log('✅ User data received:', userData);
        return userData;
    },

    logout: async (token: string) => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};