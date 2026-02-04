'use client';

import { useState, useMemo, useCallback } from 'react';
import { Navbar, Footer, Container } from '@/components/layout';
import {
  Button, Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent,
  Modal, Skeleton, ThemeSelector
} from '@/components/ui';
import { AnimeGrid, AnimeCarousel, RecentEpisodes } from '@/components/anime';
import {
  useFeaturedAnimes,
  useRecentEpisodes,
  usePopularAnimes,
  useLatestAnimes,
  useAdminSync
} from '@/hooks/useAnime';

export default function HomePage() {
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  // Fetch data from database
  const { animes: featuredAnimes, isLoading: loadingFeatured, refetch: refetchFeatured } = useFeaturedAnimes(5);
  const { episodes: recentEpisodesData, isLoading: loadingEpisodes, error: episodesError, refetch: refetchEpisodes } = useRecentEpisodes(10);
  const { animes: popularAnimesData, isLoading: loadingPopular, error: popularError, refetch: refetchPopular } = usePopularAnimes(12);
  const { animes: latestAnimesData, isLoading: loadingLatest, error: latestError, refetch: refetchLatest } = useLatestAnimes(12);

  // Admin sync
  const { syncAll, isSyncing, lastResult } = useAdminSync();

  // Handle sync button
  const handleSync = useCallback(async () => {
    const result = await syncAll();
    if (result?.success) {
      // Refetch all data after sync
      refetchFeatured();
      refetchEpisodes();
      refetchPopular();
      refetchLatest();
    }
  }, [syncAll, refetchFeatured, refetchEpisodes, refetchPopular, refetchLatest]);

  // Transform recent episodes data for RecentEpisodes component
  const recentEpisodes = useMemo(() => {
    return recentEpisodesData.map((ep) => ({
      id: String(ep.id),
      animeId: ep.anime_id,
      animeSlug: ep.anime_slug,
      animeTitle: ep.anime_title,
      animeCover: ep.anime_cover || ep.thumbnail || '',
      episodeNumber: ep.number,
      thumbnail: ep.thumbnail,
      type: 'TV',
    }));
  }, [recentEpisodesData]);

  // Transform animes data for AnimeGrid component
  const popularAnimes = useMemo(() => {
    return popularAnimesData.map((anime) => ({
      id: anime.id,
      slug: anime.slug,
      title: anime.title,
      cover_image: anime.cover_image || '',
      type: anime.type,
      status: anime.status,
      sources: anime.sources,
    }));
  }, [popularAnimesData]);

  const latestAnimes = useMemo(() => {
    return latestAnimesData.map((anime) => ({
      id: anime.id,
      slug: anime.slug,
      title: anime.title,
      cover_image: anime.cover_image || '',
      type: anime.type,
      status: anime.status,
      sources: anime.sources,
    }));
  }, [latestAnimesData]);

  // Create carousel items from featured animes
  const carouselItems = useMemo(() => {
    if (featuredAnimes.length === 0) return [];
    return featuredAnimes.map((anime) => ({
      id: anime.id,
      slug: anime.slug,
      title: anime.title,
      coverImage: anime.cover_image || '',
      bannerImage: anime.banner_image || anime.cover_image || '',
      synopsis: anime.synopsis,
      type: anime.type,
      status: anime.status,
      genres: anime.genres,
      rating: anime.sources?.animeflv?.rating,
    }));
  }, [featuredAnimes]);

  // Check if database is empty (no data synced yet)
  const isDatabaseEmpty = !loadingFeatured && !loadingPopular && !loadingLatest &&
    featuredAnimes.length === 0 && popularAnimesData.length === 0 && latestAnimesData.length === 0;

  // Show loading state for carousel
  const isCarouselLoading = loadingFeatured && carouselItems.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar
        user={{ username: 'TestUser' }}
        onLogout={() => console.log('Logout')}
      />

      <main className="flex-1 pt-16">
        {/* Admin Sync Button - Visible for now */}
        <Container className="py-4">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                Panel de Administración
              </h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                {isDatabaseEmpty
                  ? 'La base de datos está vacía. Sincroniza para cargar animes desde AnimeFLV.'
                  : 'Sincroniza para actualizar el contenido desde AnimeFLV.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setSyncModalOpen(true)}
              >
                Ver detalles
              </Button>
              <Button
                onClick={handleSync}
                isLoading={isSyncing}
                disabled={isSyncing}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}
              </Button>
            </div>
          </div>
        </Container>

        {/* Empty State */}
        {isDatabaseEmpty && !isSyncing && (
          <Container className="py-16">
            <div className="text-center">
              <svg
                className="w-24 h-24 mx-auto mb-6"
                style={{ color: 'var(--foreground-muted)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Base de datos vacía
              </h2>
              <p className="mb-6" style={{ color: 'var(--foreground-secondary)' }}>
                Presiona el botón &quot;Sincronizar Todo&quot; para cargar animes desde AnimeFLV.
              </p>
              <Button onClick={handleSync} size="lg">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sincronizar Ahora
              </Button>
            </div>
          </Container>
        )}

        {/* Hero Carousel - Full width, no padding */}
        {!isDatabaseEmpty && (
          <>
            {!isCarouselLoading && carouselItems.length > 0 && (
              <AnimeCarousel items={carouselItems} />
            )}
            {isCarouselLoading && (
              <div className="h-[500px] md:h-[550px] lg:h-[600px] flex items-center justify-center" style={{ backgroundColor: 'var(--background-secondary)' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
                  <p style={{ color: 'var(--foreground-secondary)' }}>Cargando animes...</p>
                </div>
              </div>
            )}

            {/* Recent Episodes Section */}
            <Container className="py-8">
              {episodesError ? (
                <div className="text-center py-8">
                  <p style={{ color: 'var(--error)' }}>Error al cargar episodios: {episodesError}</p>
                </div>
              ) : loadingEpisodes ? (
                <div>
                  <div className="mb-6">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="aspect-[16/10] rounded-xl mb-1" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentEpisodes.length > 0 ? (
                <RecentEpisodes
                  episodes={recentEpisodes}
                  title="Episodios recientes"
                  subtitle="Últimos capítulos de AnimeFLV"
                />
              ) : null}
            </Container>

            {/* Popular Anime Section - Animes en emisión */}
            <Container className="py-8">
              {popularError ? (
                <div className="text-center py-8">
                  <p style={{ color: 'var(--error)' }}>Error al cargar animes populares: {popularError}</p>
                </div>
              ) : (
                <AnimeGrid
                  animes={popularAnimes}
                  isLoading={loadingPopular}
                  skeletonCount={12}
                  title="En Emisión"
                  subtitle="Animes que se están emitiendo actualmente"
                  viewAllLink="/browse?status=airing"
                />
              )}
            </Container>

            {/* Latest Anime Section */}
            <Container className="py-8">
              {latestError ? (
                <div className="text-center py-8">
                  <p style={{ color: 'var(--error)' }}>Error al cargar últimos animes: {latestError}</p>
                </div>
              ) : (
                <AnimeGrid
                  animes={latestAnimes}
                  isLoading={loadingLatest}
                  skeletonCount={12}
                  title="Últimos Agregados"
                  subtitle="Animes recientemente añadidos al catálogo"
                  viewAllLink="/browse?order=added"
                />
              )}
            </Container>
          </>
        )}

        {/* Theme Selector Section */}
        <Container className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
                Personaliza tu Tema
              </h2>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                Elige entre varios temas o crea el tuyo
              </p>
            </div>
            <Button onClick={() => setThemeModalOpen(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Abrir Selector de Temas
            </Button>
          </div>

          <Card>
            <CardContent>
              <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                Usa el botón del sol/luna en el header para cambiar rápidamente entre modo claro y oscuro.
                Para más opciones de personalización, abre el selector de temas.
              </p>
            </CardContent>
          </Card>
        </Container>
      </main>

      <Footer />

      {/* Theme Selector Modal */}
      <Modal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} title="Selector de Temas" size="lg">
        <ThemeSelector onClose={() => setThemeModalOpen(false)} />
      </Modal>

      {/* Sync Details Modal */}
      <Modal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} title="Detalles de Sincronización" size="md">
        <div className="space-y-4">
          {lastResult ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                {lastResult.success ? (
                  <>
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-green-500">Sincronización exitosa</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-semibold text-red-500">Error en sincronización</span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Resultados:</h4>
                {Object.entries(lastResult.results).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
                    <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                    {value.success ? (
                      <span style={{ color: 'var(--success)' }}>
                        {value.created || 0} creados, {value.updated || 0} actualizados
                      </span>
                    ) : (
                      <span style={{ color: 'var(--error)' }}>{value.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--foreground-secondary)' }}>
              No hay resultados de sincronización aún. Presiona &quot;Sincronizar Todo&quot; para comenzar.
            </p>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="ghost" onClick={() => setSyncModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
