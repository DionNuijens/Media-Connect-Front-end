// src/app/layout.tsx
import { AuthProvider } from '@/lib/auth/authContext';
import './globals.css';

export const metadata = {
    title: 'My App',
    description: 'My Next.js App with Authentication',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}