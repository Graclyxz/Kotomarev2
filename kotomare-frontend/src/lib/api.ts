/**
 * API Client para Kotomare
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============== TIPOS BASE ==============

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: errorData.error || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}

// ============== TIPOS DE ANILIST ==============

export interface AniListAnime {
  anilist_id: number;
  mal_id: number | null;
  slug: string;
  title: string;
  synopsis: string | null;
  cover_image: string | null;
  banner_image: string | null;
  status: string | null;
  format: string | null;
  season: string | null;
  season_year: number | null;
  genres: string[];
  average_score: number | null;
  popularity: number | null;
  trending: number | null;
  episodes_count: number | null;
  next_airing_episode: number | null;
  next_airing_at: number | null;
  titles: {
    romaji: string;
    english: string | null;
    native: string | null;
    synonyms: string[];
  };
  images: {
    cover_large: string | null;
    cover_medium: string | null;
  };
  metadata: {
    source: string | null;
    duration: number | null;
    favourites: number | null;
    is_adult: boolean;
    country: string | null;
    start_date: string | null;
    end_date: string | null;
    trailer_id: string | null;
    trailer_site: string | null;
  };
  tags: Array<{ name: string; rank: number }>;
  // Solo en full
  characters?: Array<{
    id: number;
    name: string;
    image: string | null;
    role: string;
    voice_actors: Array<{
      id: number;
      name: string;
      image: string | null;
      language: string;
    }>;
  }>;
  staff?: Array<{
    id: number;
    name: string;
    image: string | null;
    role: string;
  }>;
  studios?: Array<{
    id: number;
    name: string;
    is_animation_studio: boolean;
  }>;
  relations?: Array<{
    id: number;
    title: string;
    format: string | null;
    type: string;
    relation_type: string;
    cover_image: string | null;
  }>;
  recommendations?: Array<{
    id: number;
    title: string;
    cover_image: string | null;
    format: string | null;
    average_score: number | null;
  }>;
}

export interface AniListFilters {
  genres: string[];
  tags: string[];
  formats: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
  seasons: Array<{ value: string; label: string }>;
  sources: Array<{ value: string; label: string }>;
  countries: Array<{ value: string; label: string }>;
  sorts: Array<{ value: string; label: string }>;
  years: number[];
}

// ============== TIPOS DE SCRAPING ==============

export interface StreamingSource {
  id: string;
  name: string;
  url: string;
  available: boolean;
}

export interface AnimeFLVSearchResult {
  id: string;
  title: string;
  url: string;
  cover_image: string;
  type: string;
  rating: string | null;
  description: string;
  followers: number | null;
}

export interface Episode {
  number: number;
  id: string;
}

export interface VideoServer {
  server: string;
  url: string;
  type: string;
  ads: number;
}

// ============== TIPOS DE BD LOCAL ==============

export interface SavedAnime {
  id: number;
  anilist_id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  streaming_sources: string[];
  has_streaming: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnimeCheck {
  exists: boolean;
  has_streaming: boolean;
  sources: string[];
  anime?: SavedAnime;
}

// ============== API DE ANILIST (TIEMPO REAL) ==============

export const anilistApi = {
  /**
   * Obtiene animes en tendencia
   */
  getTrending: async (limit = 10) => {
    return fetchApi<{ animes: AniListAnime[]; count: number; source: string }>(
      `/anilist/trending?limit=${limit}`
    );
  },

  /**
   * Obtiene animes populares
   */
  getPopular: async (page = 1, limit = 12) => {
    return fetchApi<{ animes: AniListAnime[]; count: number; page: number; source: string }>(
      `/anilist/popular?page=${page}&limit=${limit}`
    );
  },

  /**
   * Obtiene animes de temporada
   */
  getSeasonal: async (season?: string, year?: number, page = 1, limit = 12) => {
    const params = new URLSearchParams();
    if (season) params.set('season', season);
    if (year) params.set('year', String(year));
    params.set('page', String(page));
    params.set('limit', String(limit));

    return fetchApi<{
      animes: AniListAnime[];
      count: number;
      season: string | null;
      year: number | null;
      page: number;
      source: string;
    }>(`/anilist/seasonal?${params.toString()}`);
  },

  /**
   * Obtiene animes en emisión
   */
  getAiring: async (page = 1, limit = 12) => {
    return fetchApi<{ animes: AniListAnime[]; count: number; page: number; source: string }>(
      `/anilist/airing?page=${page}&limit=${limit}`
    );
  },

  /**
   * Obtiene detalle de un anime
   */
  getAnime: async (anilistId: number) => {
    return fetchApi<{ anime: AniListAnime; source: string }>(
      `/anilist/anime/${anilistId}`
    );
  },

  /**
   * Obtiene detalle completo de un anime (personajes, staff, etc.)
   */
  getAnimeFull: async (anilistId: number) => {
    return fetchApi<{ anime: AniListAnime; source: string }>(
      `/anilist/anime/${anilistId}/full`
    );
  },

  /**
   * Busca animes
   */
  search: async (query: string, page = 1, limit = 20) => {
    return fetchApi<{
      animes: AniListAnime[];
      count: number;
      query: string;
      page: number;
      source: string;
    }>(`/anilist/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  /**
   * Navega el catálogo con filtros avanzados
   */
  browse: async (params: {
    q?: string;
    genres?: string[];
    tags?: string[];
    year?: number;
    season?: string;
    format?: string;
    status?: string;
    source?: string;
    country?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set('q', params.q);
    if (params.genres?.length) queryParams.set('genres', params.genres.join(','));
    if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
    if (params.year) queryParams.set('year', String(params.year));
    if (params.season) queryParams.set('season', params.season);
    if (params.format) queryParams.set('format', params.format);
    if (params.status) queryParams.set('status', params.status);
    if (params.source) queryParams.set('source', params.source);
    if (params.country) queryParams.set('country', params.country);
    if (params.sort) queryParams.set('sort', params.sort);
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));

    return fetchApi<{
      animes: AniListAnime[];
      page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      per_page: number;
      source: string;
    }>(`/anilist/browse?${queryParams.toString()}`);
  },

  /**
   * Obtiene los filtros disponibles
   */
  getFilters: async () => {
    return fetchApi<AniListFilters>('/anilist/filters');
  },

  /**
   * Obtiene actores de voz filtrados por idioma con paginación
   */
  getVoiceActors: async (anilistId: number, language = 'JAPANESE', page = 1, limit = 18) => {
    return fetchApi<{
      voice_actors: Array<{
        id: number;
        name: string;
        image: string | null;
        language: string;
        characters: Array<{ name: string; image: string | null; role: string }>;
      }>;
      language: string;
      page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      anilist_id: number;
      source: string;
    }>(`/anilist/anime/${anilistId}/voice-actors?language=${language}&page=${page}&limit=${limit}`);
  },

  /**
   * Obtiene personajes con paginación (lazy loading)
   */
  getCharacters: async (anilistId: number, page = 1, limit = 16) => {
    return fetchApi<{
      characters: AniListAnime['characters'];
      page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      anilist_id: number;
      source: string;
    }>(`/anilist/anime/${anilistId}/characters?page=${page}&limit=${limit}`);
  },

  /**
   * Obtiene staff con paginación (lazy loading)
   */
  getStaff: async (anilistId: number, page = 1, limit = 18) => {
    return fetchApi<{
      staff: AniListAnime['staff'];
      page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      anilist_id: number;
      source: string;
    }>(`/anilist/anime/${anilistId}/staff?page=${page}&limit=${limit}`);
  },
};

// ============== API DE SCRAPING (BAJO DEMANDA) ==============

export const scrapeApi = {
  /**
   * Obtiene las fuentes de streaming disponibles
   */
  getSources: async () => {
    return fetchApi<{ sources: StreamingSource[] }>('/scrape/sources');
  },

  /**
   * Busca un anime en AnimeFLV
   */
  searchAnimeFLV: async (query: string) => {
    return fetchApi<{ results: AnimeFLVSearchResult[]; count: number; source: string }>(
      `/scrape/animeflv/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Obtiene detalle de un anime en AnimeFLV (sin guardar)
   */
  getAnimeFLVDetail: async (animeflvId: string) => {
    return fetchApi<{ anime: AnimeFLVSearchResult; source: string }>(
      `/scrape/animeflv/anime/${animeflvId}`
    );
  },

  /**
   * Vincula un anime de AniList con AnimeFLV y guarda en BD
   */
  linkAnimeFLV: async (data: {
    anilist_id: number;
    title: string;
    cover_image?: string;
    animeflv_id: string;
  }) => {
    return fetchApi<{
      message: string;
      anime: SavedAnime & { episodes: Episode[]; episodes_count: number };
      source: string;
    }>('/scrape/animeflv/link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtiene episodios de AnimeFLV (sin guardar)
   */
  getAnimeFLVEpisodes: async (animeflvId: string) => {
    return fetchApi<{ episodes: Array<Episode & { url: string }>; count: number; source: string }>(
      `/scrape/animeflv/${animeflvId}/episodes`
    );
  },

  /**
   * Obtiene servidores de video de un episodio
   */
  getVideoServers: async (animeflvId: string, episode: number) => {
    return fetchApi<{
      anime_id: string;
      episode: number;
      servers: VideoServer[];
      count: number;
      source: string;
    }>(`/scrape/animeflv/${animeflvId}/${episode}/servers`);
  },

  /**
   * Obtiene episodios recientes de AnimeFLV
   */
  getRecentEpisodes: async (limit = 20) => {
    return fetchApi<{
      episodes: Array<{
        id: string;
        anime_id: string;
        anime_title: string;
        episode_number: number;
        thumbnail: string;
        url: string;
      }>;
      count: number;
      source: string;
    }>(`/scrape/animeflv/recent?limit=${limit}`);
  },
};

// ============== API DE ANIMES LOCALES (BD) ==============

export const localApi = {
  /**
   * Obtiene animes guardados en la BD
   */
  getSavedAnimes: async (page = 1, perPage = 24, search?: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (search) params.set('search', search);

    return fetchApi<{
      animes: SavedAnime[];
      count: number;
      page: number;
      total_pages: number;
      total: number;
      has_next: boolean;
      has_prev: boolean;
    }>(`/anime/saved?${params.toString()}`);
  },

  /**
   * Verifica si un anime existe en la BD
   */
  checkAnime: async (anilistId: number) => {
    return fetchApi<AnimeCheck>(`/anime/check/${anilistId}`);
  },

  /**
   * Obtiene un anime de la BD por AniList ID
   */
  getAnime: async (anilistId: number) => {
    return fetchApi<{ anime: SavedAnime; source: string }>(`/anime/${anilistId}`);
  },

  /**
   * Obtiene las fuentes de streaming de un anime
   */
  getAnimeSources: async (anilistId: number) => {
    return fetchApi<{
      anime_id: number;
      anilist_id: number;
      sources: Array<{
        name: string;
        id: string;
        url: string;
        episodes_count: number;
        linked_at: string;
      }>;
      count: number;
    }>(`/anime/${anilistId}/sources`);
  },

  /**
   * Obtiene episodios de una fuente específica
   */
  getAnimeEpisodes: async (anilistId: number, source: string) => {
    return fetchApi<{
      anime_id: number;
      anilist_id: number;
      source: string;
      source_id: string;
      episodes: Episode[];
      episodes_count: number;
    }>(`/anime/${anilistId}/episodes/${source}`);
  },

  /**
   * Obtiene estadísticas de la BD
   */
  getStats: async () => {
    return fetchApi<{
      total_animes: number;
      animes_with_streaming: number;
      sources_breakdown: Record<string, number>;
    }>('/anime/stats');
  },
};

// ============== API DE ADMIN ==============

export const adminApi = {
  /**
   * Obtiene estadísticas detalladas
   */
  getStats: async () => {
    return fetchApi<{
      total_animes: number;
      total_episodes_indexed: number;
      sources_breakdown: Record<string, number>;
      storage: string;
    }>('/admin/stats');
  },

  /**
   * Lista todos los animes en la BD
   */
  listAnimes: async () => {
    return fetchApi<{
      animes: Array<{
        id: number;
        anilist_id: number;
        title: string;
        slug: string;
        sources: string[];
        created_at: string;
        updated_at: string;
      }>;
      count: number;
    }>('/admin/animes');
  },

  /**
   * Elimina un anime de la BD
   */
  deleteAnime: async (anilistId: number) => {
    return fetchApi<{ success: boolean; message: string; anilist_id: number }>(
      `/admin/anime/anilist/${anilistId}`,
      { method: 'DELETE' }
    );
  },

  /**
   * Elimina una fuente de streaming de un anime
   */
  removeSource: async (anilistId: number, sourceName: string) => {
    return fetchApi<{ success: boolean; message: string; remaining_sources: string[] }>(
      `/admin/anime/${anilistId}/source/${sourceName}`,
      { method: 'DELETE' }
    );
  },

  /**
   * Limpia toda la BD (requiere confirmación)
   */
  clearDb: async () => {
    return fetchApi<{ success: boolean; message: string }>(
      '/admin/clear-db?confirm=true',
      { method: 'POST' }
    );
  },
};

// ============== EXPORTACIONES LEGACY (compatibilidad) ==============

// Mantenemos estas exportaciones para compatibilidad con código existente
export const animeApi = {
  // Redirigir a anilistApi
  getFeaturedAnimes: anilistApi.getTrending,
  getPopularAnimes: anilistApi.getPopular,
  getLatestAnimes: anilistApi.getSeasonal,
  search: anilistApi.search,
  browse: anilistApi.browse,
  getFilters: anilistApi.getFilters,

  // Detalle de anime (primero intenta local, luego AniList)
  getAnimeDetail: async (slugOrId: string | number) => {
    if (typeof slugOrId === 'number') {
      return anilistApi.getAnime(slugOrId);
    }
    // Si es slug, intentar buscar en local primero
    return anilistApi.search(slugOrId);
  },
};
