'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  animeApi,
  adminApi,
  Anime,
  RecentEpisode,
  Episode,
  VideoSource,
  SyncAllResult,
} from '@/lib/api';

// Hook for featured animes (carousel)
export function useFeaturedAnimes(limit = 5) {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await animeApi.getFeaturedAnimes(limit);

    if (error) {
      setError(error);
    } else if (data) {
      setAnimes(data.animes);
      setError(null);
    }
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { animes, isLoading, error, refetch };
}

// Hook for recent episodes
export function useRecentEpisodes(limit = 20) {
  const [episodes, setEpisodes] = useState<RecentEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await animeApi.getRecentEpisodes(limit);

    if (error) {
      setError(error);
    } else if (data) {
      setEpisodes(data.episodes);
      setError(null);
    }
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { episodes, isLoading, error, refetch };
}

// Hook for popular animes
export function usePopularAnimes(limit = 12) {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await animeApi.getPopularAnimes(limit);

    if (error) {
      setError(error);
    } else if (data) {
      setAnimes(data.animes);
      setError(null);
    }
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { animes, isLoading, error, refetch };
}

// Hook for latest animes
export function useLatestAnimes(limit = 12) {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await animeApi.getLatestAnimes(limit);

    if (error) {
      setError(error);
    } else if (data) {
      setAnimes(data.animes);
      setError(null);
    }
    setIsLoading(false);
  }, [limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { animes, isLoading, error, refetch };
}

// Hook for anime search
export function useAnimeSearch() {
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await animeApi.search(query);

    if (error) {
      setError(error);
    } else if (data) {
      setResults(data.results);
    }
    setIsLoading(false);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, search, clearResults };
}

// Hook for anime detail
export function useAnimeDetail(slug: string) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchAnime = async () => {
      setIsLoading(true);
      const { data, error } = await animeApi.getAnimeDetail(slug);

      if (error) {
        setError(error);
      } else if (data) {
        setAnime(data.anime);
      }
      setIsLoading(false);
    };

    fetchAnime();
  }, [slug]);

  return { anime, isLoading, error };
}

// Hook for episodes list
export function useEpisodes(slug: string, source = 'animeflv') {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchEpisodes = async () => {
      setIsLoading(true);
      const { data, error } = await animeApi.getEpisodes(slug, source);

      if (error) {
        setError(error);
      } else if (data) {
        setEpisodes(data.episodes);
      }
      setIsLoading(false);
    };

    fetchEpisodes();
  }, [slug, source]);

  return { episodes, isLoading, error };
}

// Hook for video sources
export function useVideoSources(slug: string, episodeNumber: number, source = 'animeflv') {
  const [videos, setVideos] = useState<VideoSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !episodeNumber) return;

    const fetchVideos = async () => {
      setIsLoading(true);
      const { data, error } = await animeApi.getVideoSources(slug, episodeNumber, source);

      if (error) {
        setError(error);
      } else if (data) {
        setVideos(data.videos);
      }
      setIsLoading(false);
    };

    fetchVideos();
  }, [slug, episodeNumber, source]);

  return { videos, isLoading, error };
}

// Hook for admin sync
export function useAdminSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncAllResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncAll = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    const { data, error } = await adminApi.syncAll();

    if (error) {
      setError(error);
    } else if (data) {
      setLastResult(data);
    }
    setIsSyncing(false);

    return data;
  }, []);

  return { syncAll, isSyncing, lastResult, error };
}
