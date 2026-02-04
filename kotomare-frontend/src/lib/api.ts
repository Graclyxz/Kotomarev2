const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Types - Modelos de la base de datos
export interface Anime {
  id: number;
  slug: string;
  title: string;
  synopsis: string | null;
  cover_image: string | null;
  banner_image: string | null;
  status: string | null;
  type: string | null;
  genres: string[];
  sources: Record<string, AnimeSource>;
  created_at: string;
  updated_at: string;
}

export interface AnimeSource {
  id: string;
  url?: string;
  title?: string;
  rating?: string;
  votes?: string;
  episodes_count?: number;
  last_scraped?: string;
}

export interface RecentEpisode {
  id: number;
  anime_id: number;
  anime_slug: string;
  anime_title: string;
  anime_cover: string | null;
  number: number;
  title: string | null;
  thumbnail: string | null;
  source: string;
  source_url: string | null;
  aired_at: string | null;
  created_at: string;
}

export interface HomeSection {
  id: number;
  name: string;
  title: string;
  subtitle: string | null;
  order: number;
  is_active: boolean;
  max_items: number;
  section_type: string;
}

export interface SyncResult {
  success: boolean;
  created?: number;
  updated?: number;
  enriched?: number;
  created_episodes?: number;
  created_animes?: number;
  updated_animes?: number;
  total_scraped?: number;
  error?: string;
}

export interface SyncAllResult {
  success: boolean;
  results: {
    featured: SyncResult;
    recent_episodes: SyncResult;
    popular: SyncResult;
    latest: SyncResult;
  };
}

export interface Episode {
  number: number;
  id: string;
  url: string;
}

export interface VideoSource {
  server: string;
  url: string;
  type: string;
  ads: number;
}

// API Functions
export const animeApi = {
  // Get featured animes for carousel
  getFeaturedAnimes: async (limit = 5) => {
    return fetchApi<{ section: HomeSection; animes: Anime[]; count: number }>(
      `/anime/home/featured?limit=${limit}`
    );
  },

  // Get recent episodes for homepage
  getRecentEpisodes: async (limit = 20) => {
    return fetchApi<{ episodes: RecentEpisode[]; count: number }>(
      `/anime/home/recent-episodes?limit=${limit}`
    );
  },

  // Get popular/airing animes for homepage
  getPopularAnimes: async (limit = 12) => {
    return fetchApi<{ section: HomeSection; animes: Anime[]; count: number }>(
      `/anime/home/popular?limit=${limit}`
    );
  },

  // Get latest animes for homepage
  getLatestAnimes: async (limit = 12) => {
    return fetchApi<{ section: HomeSection; animes: Anime[]; count: number }>(
      `/anime/home/latest?limit=${limit}`
    );
  },

  // Search animes
  search: async (query: string) => {
    return fetchApi<{ query: string; results: Anime[]; count: number }>(
      `/anime/search?q=${encodeURIComponent(query)}`
    );
  },

  // Get anime detail
  getAnimeDetail: async (slug: string) => {
    return fetchApi<{ anime: Anime }>(`/anime/${slug}`);
  },

  // Get episodes list
  getEpisodes: async (slug: string, source = 'animeflv') => {
    return fetchApi<{ anime_id: number; source: string; episodes: Episode[] }>(
      `/anime/${slug}/episodes?source=${source}`
    );
  },

  // Get video sources for an episode
  getVideoSources: async (slug: string, episodeNumber: number, source = 'animeflv') => {
    return fetchApi<{ anime_id: number; episode: number; source: string; videos: VideoSource[] }>(
      `/anime/${slug}/episode/${episodeNumber}?source=${source}`
    );
  },
};

// Directory browse result
export interface BrowseResult {
  animes: BrowseAnime[];
  page: number;
  has_next: boolean;
  total_pages: number;
  count: number;
}

export interface BrowseAnime {
  id: string;
  title: string;
  url: string;
  cover_image: string;
  type: string;
  rating: string | null;
  description: string;
  followers: number | null;
}

export interface DirectorySyncResult extends SyncResult {
  pages_processed?: number;
}

export interface FilterOptions {
  source: string;
  genres: Record<string, string>;
  types: Record<string, string>;
  status: Record<string, string>;
  order: Record<string, string>;
  years: number[];
}

export interface Stats {
  total_animes: number;
  total_episodes: number;
  home_sections: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  sections: HomeSection[];
}

// Admin API Functions
export const adminApi = {
  // Sync all content
  syncAll: async () => {
    return fetchApi<SyncAllResult>('/admin/sync/all', { method: 'POST' });
  },

  // Sync featured animes
  syncFeatured: async (limit = 5, enrich = true) => {
    return fetchApi<SyncResult>(`/admin/sync/featured?limit=${limit}&enrich=${enrich}`, { method: 'POST' });
  },

  // Sync recent episodes
  syncEpisodes: async (limit = 20) => {
    return fetchApi<SyncResult>(`/admin/sync/episodes?limit=${limit}`, { method: 'POST' });
  },

  // Sync popular animes
  syncPopular: async (limit = 12) => {
    return fetchApi<SyncResult>(`/admin/sync/popular?limit=${limit}`, { method: 'POST' });
  },

  // Sync latest animes
  syncLatest: async (limit = 12) => {
    return fetchApi<SyncResult>(`/admin/sync/latest?limit=${limit}`, { method: 'POST' });
  },

  // Sync directory with filters
  syncDirectory: async (params: {
    pages?: number;
    genres?: string[];
    year?: number;
    types?: string[];
    status?: number[];
    order?: string;
    withDetails?: boolean;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.pages) queryParams.set('pages', String(params.pages));
    if (params.genres?.length) queryParams.set('genres', params.genres.join(','));
    if (params.year) queryParams.set('year', String(params.year));
    if (params.types?.length) queryParams.set('types', params.types.join(','));
    if (params.status?.length) queryParams.set('status', params.status.join(','));
    if (params.order) queryParams.set('order', params.order);
    if (params.withDetails) queryParams.set('with_details', 'true');

    return fetchApi<DirectorySyncResult>(
      `/admin/sync/directory?${queryParams.toString()}`,
      { method: 'POST' }
    );
  },

  // Sync top rated animes
  syncTopRated: async (pages = 3) => {
    return fetchApi<DirectorySyncResult>(
      `/admin/sync/top-rated?pages=${pages}`,
      { method: 'POST' }
    );
  },

  // Sync airing animes
  syncAiring: async (pages = 3) => {
    return fetchApi<DirectorySyncResult>(
      `/admin/sync/airing?pages=${pages}`,
      { method: 'POST' }
    );
  },

  // Sync by year
  syncByYear: async (year: number, pages = 3) => {
    return fetchApi<DirectorySyncResult>(
      `/admin/sync/by-year?year=${year}&pages=${pages}`,
      { method: 'POST' }
    );
  },

  // Sync by genre
  syncByGenre: async (genre: string, pages = 2) => {
    return fetchApi<DirectorySyncResult>(
      `/admin/sync/by-genre?genre=${genre}&pages=${pages}`,
      { method: 'POST' }
    );
  },

  // Browse directory (preview without saving)
  browse: async (params: {
    page?: number;
    query?: string;
    genres?: string[];
    year?: number;
    types?: string[];
    status?: number[];
    order?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.query) queryParams.set('q', params.query);
    if (params.genres?.length) queryParams.set('genres', params.genres.join(','));
    if (params.year) queryParams.set('year', String(params.year));
    if (params.types?.length) queryParams.set('types', params.types.join(','));
    if (params.status?.length) queryParams.set('status', params.status.join(','));
    if (params.order) queryParams.set('order', params.order);

    return fetchApi<BrowseResult>(`/admin/browse?${queryParams.toString()}`);
  },

  // Get available filters
  getFilters: async () => {
    return fetchApi<FilterOptions>('/admin/filters');
  },

  // Get stats
  getStats: async () => {
    return fetchApi<Stats>('/admin/stats');
  },

  // Clear database (sections and episodes only)
  clearDb: async () => {
    return fetchApi<{ success: boolean; message: string }>(
      '/admin/clear-db',
      { method: 'POST' }
    );
  },

  // Clear all (including animes)
  clearAll: async () => {
    return fetchApi<{ success: boolean; message: string }>(
      '/admin/clear-all',
      { method: 'POST' }
    );
  },
};
