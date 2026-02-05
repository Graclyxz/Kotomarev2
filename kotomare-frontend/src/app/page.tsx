'use client';

import { useState, useMemo } from 'react';
import { Navbar, Footer, Container } from '@/components/layout';
import {
  Button, Card, CardContent, Modal, Skeleton, ThemeSelector
} from '@/components/ui';
import { AnimeGrid, AnimeCarousel, RecentEpisodes } from '@/components/anime';
import {
  useTrendingAnimes,
  useRecentEpisodes,
  usePopularAnimes,
  useSeasonalAnimes,
  useAiringAnimes,
} from '@/hooks/useAnime';

export default function HomePage() {
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Fetch data from AniList (real-time)
  const { animes: trendingAnimes, isLoading: loadingTrending } = useTrendingAnimes(5);
  const { animes: popularAnimes, isLoading: loadingPopular } = usePopularAnimes(1, 12);
  const { animes: airingAnimes, isLoading: loadingAiring } = useAiringAnimes(12);
  const { animes: seasonalAnimes, isLoading: loadingSeasonal } = useSeasonalAnimes(undefined, undefined, 12);

  // Fetch recent episodes from AnimeFLV
  const { episodes: recentEpisodesData, isLoading: loadingEpisodes, error: episodesError } = useRecentEpisodes(10);

  // Transform recent episodes for RecentEpisodes component
  const recentEpisodes = useMemo(() => {
    return recentEpisodesData.map((ep) => ({
      id: ep.id,
      animeId: 0, // No tenemos el ID de AniList aquí
      animeSlug: ep.anime_id,
      animeTitle: ep.anime_title,
      animeCover: ep.thumbnail || '',
      episodeNumber: ep.episode_number,
      thumbnail: ep.thumbnail,
      type: 'TV',
    }));
  }, [recentEpisodesData]);

  // Transform animes for AnimeGrid component
  const popularAnimesGrid = useMemo(() => {
    return popularAnimes.map((anime) => ({
      id: anime.anilist_id,
      slug: anime.slug,
      title: anime.title,
      cover_image: anime.cover_image || '',
      type: anime.format || undefined,
      status: anime.status || undefined,
      genres: anime.genres,
      average_score: anime.average_score || undefined,
    }));
  }, [popularAnimes]);

  const airingAnimesGrid = useMemo(() => {
    return airingAnimes.map((anime) => ({
      id: anime.anilist_id,
      slug: anime.slug,
      title: anime.title,
      cover_image: anime.cover_image || '',
      type: anime.format || undefined,
      status: anime.status || undefined,
      genres: anime.genres,
      average_score: anime.average_score || undefined,
    }));
  }, [airingAnimes]);

  const seasonalAnimesGrid = useMemo(() => {
    return seasonalAnimes.map((anime) => ({
      id: anime.anilist_id,
      slug: anime.slug,
      title: anime.title,
      cover_image: anime.cover_image || '',
      type: anime.format || undefined,
      status: anime.status || undefined,
      genres: anime.genres,
      average_score: anime.average_score || undefined,
    }));
  }, [seasonalAnimes]);

  // Create carousel items from trending animes
  const carouselItems = useMemo(() => {
    if (trendingAnimes.length === 0) return [];
    return trendingAnimes.map((anime) => ({
      id: anime.anilist_id,
      slug: anime.slug,
      title: anime.title,
      coverImage: anime.cover_image || '',
      bannerImage: anime.banner_image || anime.cover_image || '',
      synopsis: anime.synopsis || undefined,
      type: anime.format || undefined,
      status: anime.status || undefined,
      genres: anime.genres,
      rating: anime.average_score ? String(anime.average_score / 10) : undefined,
    }));
  }, [trendingAnimes]);

  // Show loading state for carousel
  const isCarouselLoading = loadingTrending && carouselItems.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar
        user={{ username: 'TestUser' }}
        onLogout={() => console.log('Logout')}
      />

      <main className="flex-1 pt-16">
        {/* Hero Carousel - Trending Animes */}
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

        {/* Recent Episodes Section - From AnimeFLV */}
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

        {/* Airing Anime Section */}
        <Container className="py-8">
          <AnimeGrid
            animes={airingAnimesGrid}
            isLoading={loadingAiring}
            skeletonCount={12}
            title="En Emisión"
            subtitle="Animes que se están emitiendo actualmente"
            viewAllLink="/browse?status=RELEASING"
          />
        </Container>

        {/* Popular Anime Section */}
        <Container className="py-8">
          <AnimeGrid
            animes={popularAnimesGrid}
            isLoading={loadingPopular}
            skeletonCount={12}
            title="Populares"
            subtitle="Los animes más populares de AniList"
            viewAllLink="/browse?sort=POPULARITY_DESC"
          />
        </Container>

        {/* Seasonal Anime Section */}
        <Container className="py-8">
          <AnimeGrid
            animes={seasonalAnimesGrid}
            isLoading={loadingSeasonal}
            skeletonCount={12}
            title="Temporada Actual"
            subtitle="Animes de esta temporada"
            viewAllLink="/browse"
          />
        </Container>

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
    </div>
  );
}
