'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { tvShowService } from '@/lib/api/tvShowService';
import { TVShowDetail, RegionProviders } from '@/types/tvShow';
import Link from 'next/link';

export default function ShowDetailPage() {
    const params = useParams();
    const { user, logout } = useAuth();

    const [show, setShow] = useState<TVShowDetail | null>(null);
    const [providers, setProviders] = useState<RegionProviders | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // ▶ SAVE FUNCTIONALITY
    const [isSaved, setIsSaved] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);

    // ▶ REGION AUTO DETECT
    const [userRegion, setUserRegion] = useState<string | undefined>(undefined);
    const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         const locale = navigator.language;
    //         const region = locale.split('-')[1] || 'US';
    //         setUserRegion(region.toUpperCase());
    //     }
    // }, []);

    useEffect(() => {
        async function detectRegion() {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const json = await res.json();
                setUserRegion(json.country?.toUpperCase() || "US");
            } catch {
                setUserRegion("US");
            }
        }
        detectRegion();
    }, []);

    useEffect(() => {
        if (!params.id || !userRegion) return; // Wait until region is detected

        async function loadShowData() {
            try {
                setIsLoading(true);
                const showId = parseInt(params.id as string);
                const data = await tvShowService.getShowWithProviders(showId, userRegion);
                setShow(data.showDetails);
                setProviders(data.providers);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load show details');
            } finally {
                setIsLoading(false);
            }
        }

        loadShowData();
    }, [params.id, userRegion, user?.id]);

    const handleSaveShow = async () => {
        if (!user?.id || !show?.id) return;

        try {
            setIsSaveLoading(true);
            if (isSaved) {
                // Remove from saved
                await tvShowService.removeShow(user.id, show.id);
                setIsSaved(false);
            } else {
                // Add to saved
                await tvShowService.saveShow(user.id, show.id);
                setIsSaved(true);
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update save status');
        } finally {
            setIsSaveLoading(false);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-white text-lg">Loading show details...</p>
                </div>
            </div>
        );
    }

    if (error || !show) {
        return (
            <div className="min-h-screen bg-gray-900">
                <nav className="bg-gray-800 border-b border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <Link href="/search" className="text-white hover:text-gray-300">
                                ← Back to Search
                            </Link>
                            <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto py-12 px-4 text-center">
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg inline-block">
                        {error || 'Show not found'}
                    </div>
                    <div className="mt-6">
                        <Link href="/search" className="text-blue-500 hover:text-blue-400">
                            Return to Search
                        </Link>
                    </div>
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
                        <Link
                            href="/search"
                            className="text-white hover:text-gray-300 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Search
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">
                                Dashboard
                            </Link>
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

            {/* Show Details */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <div className="md:flex">
                        {/* Poster */}
                        <div className="md:w-1/3 lg:w-1/4">
                            {show.fullPosterUrl && !imageError['poster'] ? (
                                <Image
                                    src={show.fullPosterUrl}
                                    alt={show.name}
                                    width={500}
                                    height={750}
                                    className="w-full h-auto object-cover"
                                    onError={() => setImageError(prev => ({ ...prev, poster: true }))}
                                />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="md:w-2/3 lg:w-3/4 p-8">
                            <div className="flex items-start justify-between mb-4">
                                <h1 className="text-4xl font-bold text-white">{show.name}</h1>
                                <div className="flex items-center gap-3">
                                    {show.vote_average > 0 && (
                                        <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-lg font-bold text-lg">
                                            ⭐ {show.vote_average.toFixed(1)}
                                        </div>
                                    )}
                                    {/* ✨ SAVE BUTTON */}
                                    <button
                                        onClick={handleSaveShow}
                                        disabled={isSaveLoading}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                            isSaved
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isSaveLoading ? 'Saving...' : isSaved ? '★ Saved' : '☆ Save Show'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* First Air Date */}
                                <div>
                                    <span className="text-gray-400 text-sm">First Aired:</span>
                                    <p className="text-white">{formatDate(show.first_air_date)}</p>
                                </div>

                                {/* Watch Providers */}
                                {providers ? (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">Where to Watch</h3>

                                        {providers.flatrate && providers.flatrate.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-gray-400 text-sm mb-2">Streaming:</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {providers.flatrate.map((provider) => (
                                                        <div
                                                            key={provider.provider_id}
                                                            className="flex items-center bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition-colors"
                                                            title={provider.provider_name}
                                                        >
                                                            {provider.fullLogoUrl && !imageError[`provider-${provider.provider_id}`] ? (
                                                                <Image
                                                                    src={provider.fullLogoUrl}
                                                                    alt={provider.provider_name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 rounded"
                                                                    onError={() => setImageError(prev => ({ ...prev, [`provider-${provider.provider_id}`]: true }))}
                                                                />
                                                            ) : (
                                                                <span className="text-white text-sm px-2">{provider.provider_name}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {providers.buy && providers.buy.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-gray-400 text-sm mb-2">Buy:</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {providers.buy.map((provider) => (
                                                        <div
                                                            key={provider.provider_id}
                                                            className="flex items-center bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition-colors"
                                                            title={provider.provider_name}
                                                        >
                                                            {provider.fullLogoUrl && !imageError[`provider-${provider.provider_id}`] ? (
                                                                <Image
                                                                    src={provider.fullLogoUrl}
                                                                    alt={provider.provider_name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 rounded"
                                                                    onError={() => setImageError(prev => ({ ...prev, [`provider-${provider.provider_id}`]: true }))}
                                                                />
                                                            ) : (
                                                                <span className="text-white text-sm px-2">{provider.provider_name}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {providers.rent && providers.rent.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-gray-400 text-sm mb-2">Rent:</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {providers.rent.map((provider) => (
                                                        <div
                                                            key={provider.provider_id}
                                                            className="flex items-center bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition-colors"
                                                            title={provider.provider_name}
                                                        >
                                                            {provider.fullLogoUrl && !imageError[`provider-${provider.provider_id}`] ? (
                                                                <Image
                                                                    src={provider.fullLogoUrl}
                                                                    alt={provider.provider_name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 rounded"
                                                                    onError={() => setImageError(prev => ({ ...prev, [`provider-${provider.provider_id}`]: true }))}
                                                                />
                                                            ) : (
                                                                <span className="text-white text-sm px-2">{provider.provider_name}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {providers.link && (
                                            <a
                                                href={providers.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-400 text-sm inline-block"
                                            >
                                                View all options on JustWatch →
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">
                                        Watch provider information not available for your region.
                                    </div>
                                )}

                                {/* Genres */}
                                {show.genres && show.genres.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 text-sm">Genres:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {show.genres.map((genre) => (
                                                <span
                                                    key={genre.id}
                                                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                                                >
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status & Type */}
                                <div className="flex gap-6">
                                    {show.status && (
                                        <div>
                                            <span className="text-gray-400 text-sm">Status:</span>
                                            <p className="text-white">{show.status}</p>
                                        </div>
                                    )}
                                    {show.type && (
                                        <div>
                                            <span className="text-gray-400 text-sm">Type:</span>
                                            <p className="text-white">{show.type}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Seasons & Episodes */}
                                {(show.number_of_seasons || show.number_of_episodes) && (
                                    <div className="flex gap-6">
                                        {show.number_of_seasons && (
                                            <div>
                                                <span className="text-gray-400 text-sm">Seasons:</span>
                                                <p className="text-white text-2xl font-bold">{show.number_of_seasons}</p>
                                            </div>
                                        )}
                                        {show.number_of_episodes && (
                                            <div>
                                                <span className="text-gray-400 text-sm">Episodes:</span>
                                                <p className="text-white text-2xl font-bold">{show.number_of_episodes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Overview */}
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
                                    <p className="text-gray-300 leading-relaxed">
                                        {show.overview || 'No description available.'}
                                    </p>
                                </div>

                                {/* Created By */}
                                {show.created_by && show.created_by.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 text-sm">Created By:</span>
                                        <p className="text-white">
                                            {show.created_by.map(creator => creator.name).join(', ')}
                                        </p>
                                    </div>
                                )}

                                {/* Networks */}
                                {show.networks && show.networks.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 text-sm">Networks:</span>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {show.networks.map((network) => (
                                                <div
                                                    key={network.id}
                                                    className="bg-gray-700 px-3 py-2 rounded text-white text-sm"
                                                >
                                                    {network.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backdrop Image */}
                {show.fullBackdropUrl && !imageError['backdrop'] && (
                    <div className="mt-6 rounded-lg overflow-hidden">
                        <Image
                            src={show.fullBackdropUrl}
                            alt={`${show.name} backdrop`}
                            width={1920}
                            height={1080}
                            className="w-full h-auto"
                            onError={() => setImageError(prev => ({ ...prev, backdrop: true }))}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}