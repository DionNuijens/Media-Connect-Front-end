// src/lib/auth/tokenStorage.ts
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
    getToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        // Try cookie first, fallback to localStorage
        return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string): void => {
        // Set both cookie and localStorage
        Cookies.set(TOKEN_KEY, token, {
            expires: 7, // 7 days
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        localStorage.setItem(TOKEN_KEY, token);
    },

    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken: (token: string): void => {
        Cookies.set(REFRESH_TOKEN_KEY, token, {
            expires: 30, // 30 days
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    clearTokens: (): void => {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};