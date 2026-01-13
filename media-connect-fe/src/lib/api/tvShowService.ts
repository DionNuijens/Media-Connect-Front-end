// FILE: lib/api/tvShowService.ts

import { apiClient } from '@/lib/api/client';

export const tvShowService = {
    async searchShows(query: string) {
        const res = await apiClient(`/api/tv/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        return res.json();
    },

    async getShowWithProviders(id: number, region: string = 'US') {
        const res = await apiClient(`/api/tv/${id}/full?region=${region}`);
        if (!res.ok) throw new Error('Failed to fetch show details');
        return res.json();
    },

    async saveShow(userId: string, tmdbShowId: number) {
        const res = await apiClient(`/api/user/shows/${tmdbShowId}?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to save show');
        return res.json();
    },

    async isShowSaved(userId: string, tmdbShowId: number) {
        const res = await apiClient(`/api/user/shows/${tmdbShowId}/exists?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to check save status');
        return res.json();
    },

    async removeShow(userId: string, tmdbShowId: number) {
        const res = await apiClient(`/api/user/shows/${tmdbShowId}?userId=${userId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to remove show');
    },

    async getUserShows(userId: string) {
        const res = await apiClient(`/api/user/shows?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch user shows');
        return res.json();
    },

    async updateUserShow(userId: string, tmdbShowId: number, data: {
        personalRating?: number;
        notes?: string;
        watchStatus?: 'watching' | 'completed' | 'planning';
    }) {
        const res = await apiClient(`/api/user/shows/${tmdbShowId}?userId=${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update show');
        return res.json();
    }
};