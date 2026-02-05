'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { AnimeCard } from '@/components/anime/AnimeCard';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  Chip,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SkeletonCard,
} from '@/components/ui';
import { anilistApi, AniListAnime, AniListFilters } from '@/lib/api';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ClearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SadFaceIcon = () => (
  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--foreground-secondary)' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Tab Icons
const SlidersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

function BuscarContent() {
  const searchParams = useSearchParams();

  // Estados de resultados
  const [animes, setAnimes] = useState<AniListAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<AniListFilters | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // Filtros aplicados (los que están activos en la búsqueda)
  const [appliedFilters, setAppliedFilters] = useState({
    query: searchParams.get('q') || '',
    genres: [] as string[],
    tags: [] as string[],
    format: '',
    status: '',
    source: '',
    country: '',
    season: '',
    year: undefined as number | undefined,
    sort: 'POPULARITY_DESC',
  });

  // Filtros pendientes (los que el usuario está seleccionando)
  const [pendingFilters, setPendingFilters] = useState({ ...appliedFilters });

  // UI
  const [showFilters, setShowFilters] = useState(false);

  // Cargar filtros disponibles
  useEffect(() => {
    const loadFilters = async () => {
      const { data } = await anilistApi.getFilters();
      if (data) {
        setFilters(data);
      }
    };
    loadFilters();
  }, []);

  // Búsqueda inicial
  useEffect(() => {
    searchAnimes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función de búsqueda
  const searchAnimes = useCallback(async (pageNum = 1, filtersToUse = appliedFilters, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const { data, error } = await anilistApi.browse({
        q: filtersToUse.query || undefined,
        genres: filtersToUse.genres.length > 0 ? filtersToUse.genres : undefined,
        tags: filtersToUse.tags.length > 0 ? filtersToUse.tags : undefined,
        format: filtersToUse.format || undefined,
        status: filtersToUse.status || undefined,
        source: filtersToUse.source || undefined,
        country: filtersToUse.country || undefined,
        season: filtersToUse.season || undefined,
        year: filtersToUse.year,
        sort: filtersToUse.sort,
        page: pageNum,
        limit: 24,
      });

      if (data) {
        if (append) {
          setAnimes(prev => [...prev, ...data.animes]);
        } else {
          setAnimes(data.animes);
        }
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.total_pages);
        setHasNext(data.has_next);
      } else if (error) {
        console.error('Error buscando animes:', error);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [appliedFilters]);

  // Cargar más resultados (para modo filtrado)
  const loadMore = () => {
    if (!loadingMore && hasNext) {
      searchAnimes(page + 1, appliedFilters, true);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    setAppliedFilters({ ...pendingFilters });
    searchAnimes(1, pendingFilters);
    setShowFilters(false);
  };

  // Limpiar filtros pendientes
  const clearPendingFilters = () => {
    setPendingFilters({
      query: '',
      genres: [],
      tags: [],
      format: '',
      status: '',
      source: '',
      country: '',
      season: '',
      year: undefined,
      sort: 'POPULARITY_DESC',
    });
  };

  // Limpiar y aplicar
  const clearAndApplyFilters = () => {
    const clearedFilters = {
      query: '',
      genres: [] as string[],
      tags: [] as string[],
      format: '',
      status: '',
      source: '',
      country: '',
      season: '',
      year: undefined as number | undefined,
      sort: 'POPULARITY_DESC',
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    searchAnimes(1, clearedFilters);
  };

  // Manejar búsqueda por texto
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newFilters = { ...appliedFilters, query: pendingFilters.query };
    setAppliedFilters(newFilters);
    searchAnimes(1, newFilters);
  };

  // Toggle de género
  const toggleGenre = (genre: string) => {
    setPendingFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  // Toggle de tag
  const toggleTag = (tag: string) => {
    setPendingFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Remover filtro aplicado individual
  const removeAppliedFilter = (filterType: string, value?: string) => {
    const newFilters = { ...appliedFilters };

    switch (filterType) {
      case 'query':
        newFilters.query = '';
        setPendingFilters(prev => ({ ...prev, query: '' }));
        break;
      case 'genre':
        newFilters.genres = newFilters.genres.filter(g => g !== value);
        setPendingFilters(prev => ({ ...prev, genres: prev.genres.filter(g => g !== value) }));
        break;
      case 'tag':
        newFilters.tags = newFilters.tags.filter(t => t !== value);
        setPendingFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== value) }));
        break;
      case 'format':
        newFilters.format = '';
        setPendingFilters(prev => ({ ...prev, format: '' }));
        break;
      case 'status':
        newFilters.status = '';
        setPendingFilters(prev => ({ ...prev, status: '' }));
        break;
      case 'source':
        newFilters.source = '';
        setPendingFilters(prev => ({ ...prev, source: '' }));
        break;
      case 'country':
        newFilters.country = '';
        setPendingFilters(prev => ({ ...prev, country: '' }));
        break;
      case 'season':
        newFilters.season = '';
        setPendingFilters(prev => ({ ...prev, season: '' }));
        break;
      case 'year':
        newFilters.year = undefined;
        setPendingFilters(prev => ({ ...prev, year: undefined }));
        break;
    }

    setAppliedFilters(newFilters);
    searchAnimes(1, newFilters);
  };

  const hasAppliedFilters = appliedFilters.genres.length > 0 || appliedFilters.tags.length > 0 ||
    appliedFilters.format || appliedFilters.status || appliedFilters.source ||
    appliedFilters.country || appliedFilters.season || appliedFilters.year ||
    appliedFilters.query;

  const pendingFiltersCount = pendingFilters.genres.length + pendingFilters.tags.length +
    (pendingFilters.format ? 1 : 0) + (pendingFilters.status ? 1 : 0) + (pendingFilters.source ? 1 : 0) +
    (pendingFilters.country ? 1 : 0) + (pendingFilters.season ? 1 : 0) + (pendingFilters.year ? 1 : 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Explorar Animes
          </h1>
          <p style={{ color: 'var(--foreground-secondary)' }}>
            Busca en el catálogo de AniList con filtros avanzados
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={pendingFilters.query}
                onChange={(e) => setPendingFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Buscar por título..."
                icon={<SearchIcon />}
              />
            </div>
            <Button type="submit" variant="primary" size="lg">
              <SearchIcon />
            </Button>
            <Button
              type="button"
              variant={showFilters ? 'primary' : 'secondary'}
              size="lg"
              onClick={() => {
                setShowFilters(!showFilters);
                if (!showFilters) {
                  setPendingFilters({ ...appliedFilters });
                }
              }}
              className="relative"
            >
              <FilterIcon />
              {pendingFiltersCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {pendingFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Panel de filtros */}
        {showFilters && filters && (
          <Card className="mb-6">
            {/* Header con instrucciones */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Haz clic en las pestañas para navegar entre las opciones de filtrado</span>
              </div>
            </div>

            <Tabs defaultValue="basic">
              <TabsList className="rounded-none border-b border-border mx-4">
                <TabsTrigger
                  value="basic"
                  icon={<SlidersIcon />}
                >
                  Filtros básicos
                </TabsTrigger>
                <TabsTrigger
                  value="genres"
                  icon={<SparklesIcon />}
                  badge={pendingFilters.genres.length || undefined}
                  badgeVariant="primary"
                >
                  Géneros
                </TabsTrigger>
                <TabsTrigger
                  value="tags"
                  icon={<TagIcon />}
                  badge={pendingFilters.tags.length || undefined}
                  badgeVariant="success"
                >
                  Tags
                </TabsTrigger>
              </TabsList>

              <CardContent className="pt-6">
                {/* Tab: Filtros básicos */}
                <TabsContent value="basic" className="mt-0">
                  <div className="space-y-6">
                    {/* Ordenar */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Ordenar por
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {filters.sorts.map((sort) => (
                          <Chip
                            key={sort.value}
                            variant="primary"
                            selected={pendingFilters.sort === sort.value}
                            onClick={() => setPendingFilters(prev => ({ ...prev, sort: sort.value }))}
                          >
                            {sort.label}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* Formato */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Formato
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          variant="primary"
                          selected={!pendingFilters.format}
                          onClick={() => setPendingFilters(prev => ({ ...prev, format: '' }))}
                        >
                          Todos
                        </Chip>
                        {filters.formats.map((format) => (
                          <Chip
                            key={format.value}
                            variant="primary"
                            selected={pendingFilters.format === format.value}
                            onClick={() => setPendingFilters(prev => ({ ...prev, format: format.value }))}
                          >
                            {format.label}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Estado
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          variant="primary"
                          selected={!pendingFilters.status}
                          onClick={() => setPendingFilters(prev => ({ ...prev, status: '' }))}
                        >
                          Todos
                        </Chip>
                        {filters.statuses.map((status) => (
                          <Chip
                            key={status.value}
                            variant="primary"
                            selected={pendingFilters.status === status.value}
                            onClick={() => setPendingFilters(prev => ({ ...prev, status: status.value }))}
                          >
                            {status.label}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* Fuente original */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Fuente original
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          variant="primary"
                          selected={!pendingFilters.source}
                          onClick={() => setPendingFilters(prev => ({ ...prev, source: '' }))}
                        >
                          Todas
                        </Chip>
                        {filters.sources.map((source) => (
                          <Chip
                            key={source.value}
                            variant="primary"
                            selected={pendingFilters.source === source.value}
                            onClick={() => setPendingFilters(prev => ({ ...prev, source: source.value }))}
                          >
                            {source.label}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* País de origen */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        País de origen
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          variant="primary"
                          selected={!pendingFilters.country}
                          onClick={() => setPendingFilters(prev => ({ ...prev, country: '' }))}
                        >
                          Todos
                        </Chip>
                        {filters.countries.map((country) => (
                          <Chip
                            key={country.value}
                            variant="primary"
                            selected={pendingFilters.country === country.value}
                            onClick={() => setPendingFilters(prev => ({ ...prev, country: country.value }))}
                          >
                            {country.label}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* Temporada y Año */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Temporada
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Chip
                            variant="primary"
                            selected={!pendingFilters.season}
                            onClick={() => setPendingFilters(prev => ({ ...prev, season: '' }))}
                          >
                            Todas
                          </Chip>
                          {filters.seasons.map((season) => (
                            <Chip
                              key={season.value}
                              variant="primary"
                              selected={pendingFilters.season === season.value}
                              onClick={() => setPendingFilters(prev => ({ ...prev, season: season.value }))}
                            >
                              {season.label}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Select
                          label="Año"
                          value={pendingFilters.year?.toString() || ''}
                          onChange={(e) => setPendingFilters(prev => ({
                            ...prev,
                            year: e.target.value ? Number(e.target.value) : undefined
                          }))}
                          options={[
                            { value: '', label: 'Todos los años' },
                            ...filters.years.slice(0, 50).map((year) => ({
                              value: String(year),
                              label: String(year),
                            })),
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Géneros */}
                <TabsContent value="genres" className="mt-0">
                  <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                    Selecciona uno o más géneros para filtrar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.genres.map((genre) => (
                      <Chip
                        key={genre}
                        variant="primary"
                        selected={pendingFilters.genres.includes(genre)}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Chip>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab: Tags */}
                <TabsContent value="tags" className="mt-0">
                  <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                    Los tags son más específicos que los géneros. Selecciona para filtrar por temática.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <Chip
                        key={tag}
                        variant="success"
                        selected={pendingFilters.tags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>

              <CardFooter className="flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={clearPendingFilters}>
                  Limpiar filtros
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setShowFilters(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={applyFilters}>
                    <SearchIcon />
                    Aplicar filtros
                    {pendingFiltersCount > 0 && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        {pendingFiltersCount}
                      </span>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Tabs>
          </Card>
        )}

        {/* Filtros aplicados (chips) */}
        {hasAppliedFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Filtros activos:
            </span>
            {appliedFilters.query && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('query')}>
                &quot;{appliedFilters.query}&quot;
              </Chip>
            )}
            {appliedFilters.genres.map((genre) => (
              <Chip key={genre} variant="primary" selected onRemove={() => removeAppliedFilter('genre', genre)}>
                {genre}
              </Chip>
            ))}
            {appliedFilters.tags.map((tag) => (
              <Chip key={tag} variant="success" selected onRemove={() => removeAppliedFilter('tag', tag)}>
                {tag}
              </Chip>
            ))}
            {appliedFilters.format && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('format')}>
                {filters?.formats.find(f => f.value === appliedFilters.format)?.label}
              </Chip>
            )}
            {appliedFilters.status && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('status')}>
                {filters?.statuses.find(s => s.value === appliedFilters.status)?.label}
              </Chip>
            )}
            {appliedFilters.source && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('source')}>
                {filters?.sources.find(s => s.value === appliedFilters.source)?.label}
              </Chip>
            )}
            {appliedFilters.country && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('country')}>
                {filters?.countries.find(c => c.value === appliedFilters.country)?.label}
              </Chip>
            )}
            {appliedFilters.season && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('season')}>
                {filters?.seasons.find(s => s.value === appliedFilters.season)?.label}
              </Chip>
            )}
            {appliedFilters.year && (
              <Chip variant="primary" selected onRemove={() => removeAppliedFilter('year')}>
                {appliedFilters.year}
              </Chip>
            )}
            <Button variant="danger" size="sm" onClick={clearAndApplyFilters}>
              <ClearIcon />
              Limpiar todo
            </Button>
          </div>
        )}

        {/* Resultados */}
        <div className="mb-4 flex items-center justify-between">
          <p style={{ color: 'var(--foreground-secondary)' }}>
            {loading ? 'Buscando...' : (
              hasAppliedFilters ? (
                // Con filtros: solo mostrar cantidad cargada
                `${animes.length} animes cargados`
              ) : (
                // Sin filtros: mostrar total y paginación
                <>
                  {total.toLocaleString()} resultados
                  {totalPages > 1 && (
                    <span className="ml-2">(Página {page} de {totalPages})</span>
                  )}
                </>
              )
            )}
          </p>
        </div>

        {/* Grid de animes */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : animes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animes.map((anime) => (
              <AnimeCard
                key={anime.anilist_id}
                id={anime.anilist_id}
                slug={anime.slug}
                title={anime.title}
                coverImage={anime.cover_image || '/placeholder-anime.jpg'}
                type={anime.format || undefined}
                rating={anime.average_score ? String(anime.average_score / 10) : undefined}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <SadFaceIcon />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                No se encontraron animes
              </h3>
              <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                Intenta con otros filtros o términos de búsqueda
              </p>
              {hasAppliedFilters && (
                <Button variant="primary" onClick={clearAndApplyFilters}>
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paginación / Cargar más */}
        {hasAppliedFilters ? (
          // Con filtros: botón "Cargar más" (infinite scroll)
          hasNext && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-w-[200px]"
              >
                {loadingMore ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando...
                  </>
                ) : (
                  'Cargar más'
                )}
              </Button>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                Desplázate para ver más resultados
              </p>
            </div>
          )
        ) : (
          // Sin filtros: paginación normal
          totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Botón Anterior */}
              <Button
                variant="secondary"
                onClick={() => searchAnimes(page - 1)}
                disabled={page <= 1}
              >
                Anterior
              </Button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = [];

                  if (totalPages <= 5) {
                    // Mostrar todas si son 5 o menos
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Mostrar con elipsis
                    if (page <= 3) {
                      pages.push(1, 2, 3, '...', totalPages);
                    } else if (page >= totalPages - 2) {
                      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
                    }
                  }

                  return pages.map((p, idx) =>
                    p === '...' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => searchAnimes(p as number)}
                        className="min-w-[40px]"
                      >
                        {p}
                      </Button>
                    )
                  );
                })()}
              </div>

              {/* Botón Siguiente - usa hasNext que es confiable */}
              <Button
                variant="secondary"
                onClick={() => searchAnimes(page + 1)}
                disabled={!hasNext}
              >
                Siguiente
              </Button>
            </div>
          )
        )}
      </div>
    </Layout>
  );
}

function SearchLoading() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-9 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--background-secondary)' }} />
          <div className="h-5 w-64 mt-2 rounded animate-pulse" style={{ backgroundColor: 'var(--background-secondary)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <BuscarContent />
    </Suspense>
  );
}
