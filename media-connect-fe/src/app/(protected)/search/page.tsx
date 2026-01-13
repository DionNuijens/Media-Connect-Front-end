// src/app/(protected)/search/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

interface TVShow {
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    fullPosterUrl?: string;
    genre_ids: number[];
    vote_average: number;
    first_air_date: string;
}

interface SearchResponse {
    results: TVShow[];
    page: number;
    total_pages: number;
    total_results: number;
}

export default function SearchPage() {
    const { user, logout } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TVShow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Please enter a search term');
            return;
        }

        setIsLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const response = await apiClient(`/api/tv/search?query=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data: SearchResponse = await response.json();

            // Ensure fullPosterUrl is always set
            const updatedResults = data.results.map(show => ({
                ...show,
                fullPosterUrl: show.fullPosterUrl || (show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined)
            }));

            setResults(updatedResults);

            if (updatedResults.length === 0) {
                setError('No results found. Try a different search term.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search shows');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navigation */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-semibold text-white">TV Show Search</h1>
                            <Link
                                href="/dashboard"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Dashboard
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-400 text-sm">Welcome, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search Section */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Search TV Shows</h2>

                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for TV shows... (e.g., Stranger Things)"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </span>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {hasSearched && !isLoading && (
                    <div>
                        {results.length > 0 ? (
                            <>
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    Found {results.length} result{results.length !== 1 ? 's' : ''}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {results.map((show) => (
                                        <Link
                                            key={show.id}
                                            href={`/search/${show.id}`}
                                            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl hover:scale-105 transform duration-200"
                                        >
                                            {/* Poster Image */}
                                            <div className="relative aspect-[2/3] bg-gray-700">
                                                {show.fullPosterUrl ? (
                                                    <img
                                                        src={show.fullPosterUrl}
                                                        alt={show.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/500x750?text=No+Image';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        No Image
                                                    </div>
                                                )}

                                                {/* Rating Badge */}
                                                {show.vote_average > 0 && (
                                                    <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 px-2 py-1 rounded-lg font-bold text-sm">
                                                        ⭐ {show.vote_average.toFixed(1)}
                                                    </div>
                                                )}

                                                {/*/!* Hover Overlay *!/*/}
                                                {/*<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center">*/}
                                                {/*    <span className="text-white opacity-0 hover:opacity-100 transition-opacity font-semibold">*/}
                                                {/*        View Details*/}
                                                {/*    </span>*/}
                                                {/*</div>*/}
                                            </div>

                                            {/* Show Info */}
                                            <div className="p-4">
                                                <h4 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                                                    {show.name}
                                                </h4>

                                                <p className="text-sm text-gray-400 mb-3">
                                                    {formatDate(show.first_air_date)}
                                                </p>

                                                <p className="text-sm text-gray-300 line-clamp-3">
                                                    {show.overview || 'No description available.'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-400">No results found</h3>
                                <p className="mt-1 text-sm text-gray-500">Try searching for a different TV show.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Initial State */}
                {!hasSearched && !isLoading && (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                            />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-400">Start searching for TV shows</h3>
                        <p className="mt-2 text-sm text-gray-500">Enter a TV show name in the search box above.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
