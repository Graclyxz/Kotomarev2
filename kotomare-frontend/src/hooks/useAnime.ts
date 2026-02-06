'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  anilistApi,
  scrapeApi,
  AniListAnime,
  VideoServer,
  AnimeFLVSearchResult,
} from '@/lib/api';

// ============== HOOKS DE ANILIST (CATALOGO) ==============

/**
 * Hook para obtener animes en tendencia (para carrusel/hero)
 */
export function useTrendingAnimes(limit = 10) {
  const [animes, setAnimes] = useState<AniListAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await anilistApi.getTrending(limit);

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

/**
 * Hook para obtener animes populares
 */
export function usePopularAnimes(page = 1, limit = 12) {
  const [animes, setAnimes] = useState<AniListAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await anilistApi.getPopular(page, limit);

    if (error) {
      setError(error);
    } else if (data) {
      setAnimes(data.animes);
      setError(null);
    }
    setIsLoading(false);
  }, [page, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { animes, isLoading, error, refetch };
}

/**
 * Hook para obtener animes de temporada
 */
export function useSeasonalAnimes(season?: string, year?: number, limit = 12) {
  const [animes, setAnimes] = useState<AniListAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await anilistApi.getSeasonal(season, year, 1, limit);

    if (error) {
      setError(error);
    } else if (data) {
      setAnimes(data.animes);
      setError(null);
    }
    setIsLoading(false);
  }, [season, year, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { animes, isLoading, error, refetch };
}

/**
 * Hook para obtener animes en emision
 */
export function useAiringAnimes(limit = 12) {
  const [animes, setAnimes] = useState<AniListAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await anilistApi.getAiring(1, limit);

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

/**
 * Hook para busqueda de animes
 */
export function useAnimeSearch() {
  const [results, setResults] = useState<AniListAnime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await anilistApi.search(query);

    if (error) {
      setError(error);
    } else if (data) {
      setResults(data.animes);
    }
    setIsLoading(false);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, search, clearResults };
}

/**
 * Hook para obtener detalle de un anime
 */
export function useAnimeDetail(anilistId: number | null, full = false) {
  const [anime, setAnime] = useState<AniListAnime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!anilistId) {
      setIsLoading(false);
      return;
    }

    const fetchAnime = async () => {
      setIsLoading(true);
      const { data, error } = full
        ? await anilistApi.getAnimeFull(anilistId)
        : await anilistApi.getAnime(anilistId);

      if (error) {
        setError(error);
      } else if (data) {
        setAnime(data.anime);
      }
      setIsLoading(false);
    };

    fetchAnime();
  }, [anilistId, full]);

  return { anime, isLoading, error };
}

// ============== HOOKS DE SCRAPING (VIDEOS) ==============

/**
 * Hook para buscar anime en AnimeFLV
 */
export function useAnimeFLVSearch() {
  const [results, setResults] = useState<AnimeFLVSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await scrapeApi.searchAnimeFLV(query);

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

/**
 * Hook para obtener servidores de video
 */
export function useVideoServers(animeflvId: string | null, episode: number | null) {
  const [servers, setServers] = useState<VideoServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!animeflvId || !episode) {
      setServers([]);
      return;
    }

    const fetchServers = async () => {
      setIsLoading(true);
      const { data, error } = await scrapeApi.getVideoServers(animeflvId, episode);

      if (error) {
        setError(error);
      } else if (data) {
        setServers(data.servers);
      }
      setIsLoading(false);
    };

    fetchServers();
  }, [animeflvId, episode]);

  return { servers, isLoading, error };
}

/**
 * Hook para obtener episodios recientes de AnimeFLV
 */
export function useRecentEpisodes(limit = 20) {
  const [episodes, setEpisodes] = useState<Array<{
    id: string;
    anime_id: string;
    anime_title: string;
    episode_number: number;
    thumbnail: string;
    url: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await scrapeApi.getRecentEpisodes(limit);

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

// ============== ALIASES PARA COMPATIBILIDAD ==============

// Mantener nombres antiguos para compatibilidad con codigo existente
export const useFeaturedAnimes = useTrendingAnimes;
export const useLatestAnimes = useSeasonalAnimes;
