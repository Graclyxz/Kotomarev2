'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  anilistApi,
  scrapeApi,
  localApi,
  AniListAnime,
  VideoServer,
  Episode,
  AnimeFLVSearchResult,
} from '@/lib/api';

// ============== HOOKS DE ANILIST (CATÁLOGO) ==============

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
 * Hook para obtener animes en emisión
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
 * Hook para búsqueda de animes
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
 * Hook para vincular anime con AnimeFLV
 */
export function useLinkAnimeFLV() {
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = useCallback(async (data: {
    anilist_id: number;
    title: string;
    cover_image?: string;
    animeflv_id: string;
  }) => {
    setIsLinking(true);
    setError(null);

    const response = await scrapeApi.linkAnimeFLV(data);

    if (response.error) {
      setError(response.error);
      setIsLinking(false);
      return null;
    }

    setIsLinking(false);
    return response.data;
  }, []);

  return { link, isLinking, error };
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

// ============== HOOKS DE BD LOCAL ==============

/**
 * Hook para verificar si un anime tiene fuentes en la BD
 */
export function useAnimeCheck(anilistId: number | null) {
  const [exists, setExists] = useState(false);
  const [hasStreaming, setHasStreaming] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!anilistId) {
      setIsLoading(false);
      return;
    }

    const check = async () => {
      setIsLoading(true);
      const { data } = await localApi.checkAnime(anilistId);

      if (data) {
        setExists(data.exists);
        setHasStreaming(data.has_streaming);
        setSources(data.sources);
      }
      setIsLoading(false);
    };

    check();
  }, [anilistId]);

  return { exists, hasStreaming, sources, isLoading };
}

/**
 * Hook para obtener episodios guardados de un anime
 */
export function useSavedEpisodes(anilistId: number | null, source: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!anilistId || !source) {
      setIsLoading(false);
      return;
    }

    const fetchEpisodes = async () => {
      setIsLoading(true);
      const { data, error } = await localApi.getAnimeEpisodes(anilistId, source);

      if (error) {
        setError(error);
      } else if (data) {
        setEpisodes(data.episodes);
        setSourceId(data.source_id);
      }
      setIsLoading(false);
    };

    fetchEpisodes();
  }, [anilistId, source]);

  return { episodes, sourceId, isLoading, error };
}

// ============== ALIASES PARA COMPATIBILIDAD ==============

// Mantener nombres antiguos para compatibilidad con código existente
export const useFeaturedAnimes = useTrendingAnimes;
export const useLatestAnimes = useSeasonalAnimes;
