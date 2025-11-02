// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    console.log('🔒 Middleware check:', {
        path: request.nextUrl.pathname,
        hasToken: !!token,
        isProtectedRoute,
        isAuthPage
    });

    // Redirect to login if accessing protected route without token
    if (isProtectedRoute && !token) {
        console.log('🚫 No token, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if accessing login with valid token
    if (isAuthPage && token) {
        console.log('✅ Has token, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};