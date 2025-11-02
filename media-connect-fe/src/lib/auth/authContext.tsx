// src/lib/auth/authContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './authService';
import { tokenStorage } from './tokenStorage';
import { AuthContextType, LoginCredentials, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = tokenStorage.getToken();
            console.log('🔄 Initializing auth, token exists:', !!token);

            if (token) {
                try {
                    // Fetch user data from /api/user/me
                    const userData = await authService.getCurrentUser(token);
                    console.log('✅ User loaded on init:', userData);
                    setUser(userData);
                } catch (error) {
                    console.error('❌ Failed to load user, token may be expired:', error);
                    tokenStorage.clearTokens();
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        console.log('🔐 Step 1: Attempting login with:', credentials.email);

        // Step 1: Get token from login endpoint
        const response = await authService.login(credentials);
        console.log('✅ Step 2: Got token from login');

        // Step 2: Save the token
        tokenStorage.setToken(response.token);

        if (response.refreshToken) {
            tokenStorage.setRefreshToken(response.refreshToken);
        }

        // Step 3: Fetch user data using the token
        console.log('📡 Step 3: Fetching user data from /api/user/me');
        try {
            const userData = await authService.getCurrentUser(response.token);
            console.log('✅ Step 4: Got user data:', userData);
            setUser(userData);
        } catch (error) {
            console.error('❌ Failed to fetch user data:', error);
            tokenStorage.clearTokens();
            throw new Error('Login succeeded but failed to get user information');
        }

        console.log('✅ Step 5: Login complete, redirecting to dashboard');
        router.push('/dashboard');
    };

    const logout = async () => {
        const token = tokenStorage.getToken();

        if (token) {
            await authService.logout(token);
        }

        tokenStorage.clearTokens();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};