'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { apiClient } from '@/lib/api/client';
import { tvShowService } from '@/lib/api/tvShowService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Show {
    tmdbId: number;
    name: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number;
    firstAirDate: string;
    numberOfSeasons: number;
    numberOfEpisodes: number;
    status: string;
    type: string;
    fullPosterUrl?: string;
    fullBackdropUrl?: string;
}

interface UserShow {
    id: number;
    userId: string;
    tmdbId: number;
    personalRating: number | null;
    notes: string | null;
    watchStatus: 'watching' | 'completed' | 'planning' | null;
    savedAt: string;
    updatedAt: string;
    show: Show;
}

type SortBy = 'date-saved' | 'name' | 'rating' | 'vote-average';
type FilterStatus = 'all' | 'watching' | 'completed' | 'planning';

export default function MyShowsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [shows, setShows] = useState<UserShow[]>([]);
    const [filteredShows, setFilteredShows] = useState<UserShow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // List visibility
    const [isPublic, setIsPublic] = useState(user?.isPublic ?? false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

    // Filtering & Sorting
    const [sortBy, setSortBy] = useState<SortBy>('date-saved');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal for editing
    const [editingShowId, setEditingShowId] = useState<number | null>(null);
    const [editData, setEditData] = useState<{ rating?: number; notes?: string; status?: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user?.id) {
            router.push('/login');
        }
    }, [user?.id, isLoading, router]);

    useEffect(() => {
        if (user?.isPublic !== undefined) {
            setIsPublic(user.isPublic);
        }
    }, [user?.isPublic]);

    useEffect(() => {
        if (!user?.id) return;

        const loadUserShows = async () => {
            try {
                setIsLoading(true);
                const data = await tvShowService.getUserShows(user.id);
                setShows(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load your shows');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserShows();
    }, [user?.id]);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = [...shows];

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(us => us.watchStatus === filterStatus);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(us =>
                us.show.name.toLowerCase().includes(query) ||
                us.show.overview?.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-saved':
                    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
                case 'name':
                    return a.show.name.localeCompare(b.show.name);
                case 'rating':
                    return (b.personalRating || 0) - (a.personalRating || 0);
                case 'vote-average':
                    return (b.show.voteAverage || 0) - (a.show.voteAverage || 0);
                default:
                    return 0;
            }
        });

        setFilteredShows(filtered);
    }, [shows, sortBy, filterStatus, searchQuery]);

    const handleListVisibilityChange = async (newStatus: boolean) => {
        if (!user?.id) return;

        setIsUpdatingStatus(true);
        setStatusError(null);
        setStatusSuccess(null);

        try {
            const response = await apiClient(`/api/users/${user.id}/public-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ isPublic: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update list visibility');
            }

            setIsPublic(newStatus);
            setStatusSuccess(
                newStatus ? 'Your list is now public' : 'Your list is now private'
            );

            // Clear success message after 3 seconds
            setTimeout(() => setStatusSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating list visibility:', err);
            setStatusError(err instanceof Error ? err.message : 'Failed to update list visibility');
            // Revert the toggle on error
            setIsPublic(!newStatus);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleRemoveShow = async (userShowId: number, tmdbId: number) => {
        if (!user?.id) return;
        if (!confirm('Remove this show from your list?')) return;

        try {
            await tvShowService.removeShow(user.id, tmdbId);
            setShows(shows.filter(s => s.id !== userShowId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove show');
        }
    };

    const handleEditShow = (userShow: UserShow) => {
        setEditingShowId(userShow.id);
        setEditData({
            rating: userShow.personalRating || undefined,
            notes: userShow.notes || undefined,
            status: userShow.watchStatus || undefined
        });
    };

    const handleSaveEdit = async (tmdbId: number) => {
        if (!user?.id) return;

        try {
            setIsSaving(true);
            const updated = await tvShowService.updateUserShow(user.id, tmdbId, {
                personalRating: editData.rating,
                notes: editData.notes,
                watchStatus: editData.status as any
            });

            setShows(shows.map(s => s.tmdbId === tmdbId ? updated : s));
            setEditingShowId(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update show');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusColor = (status: string | null): string => {
        switch (status) {
            case 'watching':
                return 'bg-blue-900 text-blue-200';
            case 'completed':
                return 'bg-green-900 text-green-200';
            case 'planning':
                return 'bg-purple-900 text-purple-200';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-white text-lg">Loading your shows...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navigation */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/dashboard" className="text-white hover:text-gray-300 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-white font-bold text-xl">My Shows</h1>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* List Visibility Section */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">
                                List Visibility
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {isPublic
                                    ? 'Your show list is public and visible to others'
                                    : 'Your show list is private and only visible to you'}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => handleListVisibilityChange(e.target.checked)}
                                disabled={isUpdatingStatus}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                        </label>
                    </div>

                    {statusError && (
                        <div className="mt-3 p-2 bg-red-900 text-red-200 rounded text-sm">
                            {statusError}
                        </div>
                    )}

                    {statusSuccess && (
                        <div className="mt-3 p-2 bg-green-900 text-green-200 rounded text-sm">
                            {statusSuccess}
                        </div>
                    )}
                </div>

                {shows.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">You haven't saved any shows yet</p>
                        <Link href="/search" className="text-blue-500 hover:text-blue-400">
                            Search and save shows →
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Controls */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search shows..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Filter by Status */}
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Watch Status</label>
                                    <select
                                        id="watch-status"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Shows</option>
                                        <option value="watching">Watching</option>
                                        <option value="completed">Completed</option>
                                        <option value="planning">Planning</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="date-saved">Recently Saved</option>
                                        <option value="name">Name (A-Z)</option>
                                        <option value="rating">Your Rating</option>
                                        <option value="vote-average">TMDB Rating</option>
                                    </select>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-end">
                                    <p className="text-gray-400 text-sm">
                                        Showing <span className="text-white font-bold">{filteredShows.length}</span> of{' '}
                                        <span className="text-white font-bold">{shows.length}</span> shows
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Shows Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredShows.map((userShow) => (
                                <div
                                    key={userShow.id}
                                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors group"
                                >
                                    {/* Poster */}
                                    <div className="relative aspect-[2/3] overflow-hidden bg-gray-700">
                                        {userShow.show.posterPath ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${userShow.show.posterPath}`}
                                                alt={userShow.show.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                No Image
                                            </div>
                                        )}

                                        {/* Vote Average Badge */}
                                        {userShow.show.voteAverage > 0 && (
                                            <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 px-2 py-1 rounded text-sm font-bold">
                                                ⭐ {userShow.show.voteAverage.toFixed(1)}
                                            </div>
                                        )}

                                        {/* Watch Status Badge */}
                                        {userShow.watchStatus && (
                                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(userShow.watchStatus)}`}>
                                                {userShow.watchStatus.charAt(0).toUpperCase() + userShow.watchStatus.slice(1)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Title */}
                                        <Link href={`/search/${userShow.tmdbId}`}>
                                            <h3 className="text-white font-semibold hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                                                {userShow.show.name}
                                            </h3>
                                        </Link>

                                        {/* Show Info */}
                                        <div className="text-gray-400 text-sm space-y-1 mb-4">
                                            {userShow.show.numberOfSeasons && (
                                                <p>{userShow.show.numberOfSeasons} Season{userShow.show.numberOfSeasons !== 1 ? 's' : ''}</p>
                                            )}
                                            <p>{userShow.show.status}</p>
                                        </div>

                                        {/* Personal Rating */}
                                        {userShow.personalRating && (
                                            <div className="mb-3 pb-3 border-t border-gray-700">
                                                <p className="text-gray-400 text-xs mb-1">Your Rating</p>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < Math.round(userShow.personalRating! / 2) ? 'text-yellow-400' : 'text-gray-600'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="text-gray-400 text-sm ml-2">{userShow.personalRating}/10</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {userShow.notes && (
                                            <div className="mb-3 pb-3 border-t border-gray-700">
                                                <p className="text-gray-400 text-xs mb-1">Notes</p>
                                                <p className="text-gray-300 text-sm line-clamp-2">{userShow.notes}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-700">
                                            {editingShowId === userShow.id ? (
                                                <div className="w-full space-y-3 bg-gray-700 p-4 rounded">
                                                    {/* Rating Input */}
                                                    <div>
                                                        <label className="block text-gray-300 text-xs mb-1">Your Rating (1-10)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={editData.rating || ''}
                                                            onChange={(e) => setEditData({ ...editData, rating: e.target.value ? parseInt(e.target.value) : undefined })}
                                                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>

                                                    {/* Status Select */}
                                                    <div>
                                                        <label htmlFor="edit-watch-status" className="block text-gray-300 text-xs mb-1">Watch Status</label>
                                                        <select
                                                            id="edit-watch-status"
                                                            value={editData.status || ''}
                                                            onChange={(e) => setEditData({ ...editData, status: e.target.value || undefined })}
                                                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                                        >
                                                            <option value="">None</option>
                                                            <option value="watching">Watching</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="planning">Planning</option>
                                                        </select>
                                                    </div>

                                                    {/* Notes Input */}
                                                    <div>
                                                        <label className="block text-gray-300 text-xs mb-1">Notes</label>
                                                        <textarea
                                                            value={editData.notes || ''}
                                                            onChange={(e) => setEditData({ ...editData, notes: e.target.value || undefined })}
                                                            placeholder="Add notes..."
                                                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                                                        />
                                                    </div>

                                                    {/* Save/Cancel Buttons */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSaveEdit(userShow.tmdbId)}
                                                            disabled={isSaving}
                                                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold disabled:opacity-50"
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingShowId(null)}
                                                            className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm font-semibold"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEditShow(userShow)}
                                                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveShow(userShow.id, userShow.tmdbId)}
                                                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}