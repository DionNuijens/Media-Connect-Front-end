// src/app/(protected)/dashboard/page.tsx
'use client';

import { useAuth } from '@/lib/auth/authContext';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Welcome, {user?.name || user?.email}!
                        </h2>
                        <p className="text-gray-600">
                            You are successfully logged in.
                        </p>
                        <div className="mt-4 p-4 bg-gray-100 rounded">
                            <h3 className="font-semibold mb-2">User Info:</h3>
                            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}