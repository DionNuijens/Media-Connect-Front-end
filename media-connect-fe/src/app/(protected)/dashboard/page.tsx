'use client';

import { useAuth } from '@/lib/auth/authContext';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, logout, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleDeleteAccount = async () => {
        if (!user?.id) return;

        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone and will delete all your saved shows.'
        );

        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            // Call your Account Service delete endpoint
            const response = await apiClient(`/api/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Logout and redirect
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Error deleting account:', error);
            setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-xl text-white">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
                            <Link
                                href="/search"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Search TV Shows
                            </Link>
                            <Link
                                href="/my-shows"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                My Shows
                            </Link>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-700 rounded-lg p-8 bg-gray-800">
                        <h2 className="text-2xl font-bold mb-4 text-white">
                            Welcomee, {user.name || user.email}!
                        </h2>
                        <p className="text-gray-400 mb-6">
                            You are successfully logged in.
                        </p>

                        {/* Quick Actions */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    href="/search"
                                    className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="h-8 w-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-white font-medium">Search TV Shows</h4>
                                            <p className="text-gray-400 text-sm">Find your favorite shows</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href="/my-shows"
                                    className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="h-8 w-8 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-white font-medium">My Shows</h4>
                                            <p className="text-gray-400 text-sm">View your saved shows</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                            <h3 className="font-semibold mb-2 text-white">User Info:</h3>
                            <pre className="text-sm text-gray-300 overflow-x-auto">{JSON.stringify(user, null, 2)}</pre>
                        </div>

                        {/* Delete Account Section */}
                        <div className="mt-8 pt-8 border-t border-gray-700">
                            <h3 className="text-lg font-semibold text-red-500 mb-3">Danger Zone</h3>
                            <p className="text-gray-400 mb-4">
                                Permanently delete your account and all associated data
                            </p>
                            {deleteError && (
                                <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg text-sm">
                                    {deleteError}
                                </div>
                            )}
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Account'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}