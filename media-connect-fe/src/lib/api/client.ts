// src/lib/api/client.ts
import { tokenStorage } from '../auth/tokenStorage';

// MAKE SURE THIS IS CORRECT:
const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;  // ✅ Should be this
// NOT this:
// const API_URL = '/api/proxy';  // ❌ Wrong!

export async function apiClient(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = tokenStorage.getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        console.warn('⚠️ 401 Unauthorized - redirecting to login');
        tokenStorage.clearTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    return response;
}