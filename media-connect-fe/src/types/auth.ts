// src/types/auth.ts
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user: User;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}