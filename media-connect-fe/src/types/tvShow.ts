// src/types/tvShow.ts
export interface TVShow {
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    fullPosterUrl: string;
    genre_ids: number[];
    vote_average: number;
    first_air_date: string;
}

export interface TVShowSearchResponse {
    results: TVShow[];
    page: number;
    total_pages: number;
    total_results: number;
}

export interface TVShowDetail extends TVShow {
    backdrop_path?: string;
    fullBackdropUrl?: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
    status?: string;
    type?: string;
    genres?: Genre[];
    created_by?: Creator[];
    networks?: Network[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface Creator {
    id: number;
    name: string;
}

export interface Network {
    id: number;
    name: string;
    logo_path?: string;
}

export interface WatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
    fullLogoUrl?: string;
}

export interface RegionProviders {
    link: string;
    flatrate?: WatchProvider[];
    buy?: WatchProvider[];
    rent?: WatchProvider[];
    free?: WatchProvider[];
}

export interface WatchProvidersResponse {
    id: number;
    results: {
        [countryCode: string]: RegionProviders;
    };
}