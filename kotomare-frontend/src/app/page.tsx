'use client';

import { useState } from 'react';
import { Navbar, Footer, Container } from '@/components/layout';
import {
  Button, Input, Badge, Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent,
  Modal, Avatar, SearchBar, Skeleton, SkeletonCard, ThemeSelector
} from '@/components/ui';
import { AnimeCard, AnimeGrid, AnimeCarousel, VideoPlayer, EpisodeList, RecentEpisodes } from '@/components/anime';

// Datos de ejemplo para el carrusel hero
const mockCarouselItems = [
  {
    id: 1,
    slug: 'frieren',
    title: 'Sousou no Frieren',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg',
    synopsis: 'La elfa maga Frieren y su grupo de héroes derrotaron al Rey Demonio después de un viaje de 10 años. Ahora vive sola, viajando y coleccionando hechizos.',
    type: 'TV',
    rating: '4.9',
    genres: ['Aventura', 'Drama', 'Fantasía'],
    year: 2024,
    status: 'En emisión',
  },
  {
    id: 2,
    slug: 'one-piece',
    title: 'One Piece',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
    synopsis: 'Sigue las aventuras de Monkey D. Luffy y su tripulación pirata en busca del tesoro más grande del mundo, el One Piece.',
    type: 'TV',
    rating: '4.8',
    genres: ['Acción', 'Aventura', 'Comedia'],
    year: 1999,
    status: 'En emisión',
  },
  {
    id: 3,
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg',
    synopsis: 'Un estudiante de secundaria se une a una organización secreta de hechiceros para eliminar una poderosa maldición.',
    type: 'TV',
    rating: '4.7',
    genres: ['Acción', 'Fantasía', 'Sobrenatural'],
    year: 2023,
    status: 'Finalizado',
  },
  {
    id: 4,
    slug: 'demon-slayer',
    title: 'Kimetsu no Yaiba',
    coverImage: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg',
    synopsis: 'Tanjiro Kamado se convierte en un cazador de demonios para vengar a su familia y curar a su hermana Nezuko.',
    type: 'TV',
    rating: '4.8',
    genres: ['Acción', 'Fantasía', 'Shounen'],
    year: 2019,
    status: 'Finalizado',
  },
];

// Episodios recientes
const mockRecentEpisodes = [
  { id: '1', animeId: 1, animeSlug: 'darwin-jihen', animeTitle: 'Darwin Jihen', animeCover: 'https://cdn.myanimelist.net/images/anime/1935/143671l.jpg', episodeNumber: 5, type: 'TV', rating: '4.2' },
  { id: '2', animeId: 2, animeSlug: 'yoroi-shin-den', animeTitle: 'Yoroi Shin Den Samurai Troopers', animeCover: 'https://cdn.myanimelist.net/images/anime/1223/143557l.jpg', episodeNumber: 5, type: 'OVA', rating: '3.8' },
  { id: '3', animeId: 3, animeSlug: 'yuusha-party', animeTitle: 'Yuusha Party ni Kawaii Ko', animeCover: 'https://cdn.myanimelist.net/images/anime/1493/143204l.jpg', episodeNumber: 5, type: 'TV', rating: '4.0' },
  { id: '4', animeId: 4, animeSlug: 'isekai-shachiku', animeTitle: 'Isekai no Sata wa Shachiku', animeCover: 'https://cdn.myanimelist.net/images/anime/1756/143536l.jpg', episodeNumber: 5, type: 'TV', rating: '3.9' },
  { id: '5', animeId: 5, animeSlug: 'blue-lock', animeTitle: 'Blue Lock Season 2', animeCover: 'https://cdn.myanimelist.net/images/anime/1567/143694l.jpg', episodeNumber: 18, type: 'TV', rating: '4.5' },
  { id: '6', animeId: 6, animeSlug: 'dandadan', animeTitle: 'Dandadan', animeCover: 'https://cdn.myanimelist.net/images/anime/1255/142091l.jpg', episodeNumber: 12, type: 'TV', rating: '4.7' },
];

// Animes populares
const mockAnimes = [
  { id: 1, slug: 'frieren', title: 'Sousou no Frieren', cover_image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', type: 'TV', sources: { mal: { rating: '4.9' } } },
  { id: 2, slug: 'one-piece', title: 'One Piece', cover_image: 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg', type: 'TV', sources: { mal: { rating: '4.8' } } },
  { id: 3, slug: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', cover_image: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg', type: 'TV', sources: { mal: { rating: '4.7' } } },
  { id: 4, slug: 'demon-slayer', title: 'Kimetsu no Yaiba', cover_image: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg', type: 'TV', sources: { mal: { rating: '4.8' } } },
  { id: 5, slug: 'solo-leveling', title: 'Solo Leveling', cover_image: 'https://cdn.myanimelist.net/images/anime/1139/142631l.jpg', type: 'TV', sources: { mal: { rating: '4.6' } } },
  { id: 6, slug: 'blue-lock', title: 'Blue Lock', cover_image: 'https://cdn.myanimelist.net/images/anime/1567/143694l.jpg', type: 'TV', sources: { mal: { rating: '4.5' } } },
];

// Animes de temporada
const mockSeasonAnimes = [
  { id: 7, slug: 'dandadan', title: 'Dandadan', cover_image: 'https://cdn.myanimelist.net/images/anime/1255/142091l.jpg', type: 'TV', sources: { mal: { rating: '4.7' } } },
  { id: 8, slug: 'oshi-no-ko-2', title: 'Oshi no Ko Season 2', cover_image: 'https://cdn.myanimelist.net/images/anime/1764/141930l.jpg', type: 'TV', sources: { mal: { rating: '4.6' } } },
  { id: 9, slug: 're-zero-3', title: 'Re:Zero Season 3', cover_image: 'https://cdn.myanimelist.net/images/anime/1400/142635l.jpg', type: 'TV', sources: { mal: { rating: '4.5' } } },
  { id: 10, slug: 'mha-7', title: 'Boku no Hero Academia S7', cover_image: 'https://cdn.myanimelist.net/images/anime/1389/142269l.jpg', type: 'TV', sources: { mal: { rating: '4.4' } } },
  { id: 11, slug: 'bleach-tybw', title: 'Bleach: TYBW', cover_image: 'https://cdn.myanimelist.net/images/anime/1908/135431l.jpg', type: 'TV', sources: { mal: { rating: '4.8' } } },
  { id: 12, slug: 'chainsaw-man', title: 'Chainsaw Man', cover_image: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg', type: 'TV', sources: { mal: { rating: '4.6' } } },
];

const mockEpisodes = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1),
  number: i + 1,
  url: `https://example.com/episode/${i + 1}`,
}));

const mockServers = [
  { server: 'StreamWish', url: 'https://streamwish.to/e/example', type: 'SUB', ads: 0 },
  { server: 'MEGA', url: 'https://mega.nz/embed/example', type: 'SUB', ads: 0 },
  { server: 'Stape', url: 'https://streamtape.com/e/example', type: 'SUB', ads: 1 },
];

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar
        user={{ username: 'TestUser' }}
        onLogout={() => console.log('Logout')}
      />

      <main className="flex-1 pt-16">
        {/* Hero Carousel - Full width, no padding */}
        <AnimeCarousel items={mockCarouselItems} />

        {/* Recent Episodes Section */}
        <Container className="py-8">
          <RecentEpisodes
            episodes={mockRecentEpisodes}
            title="Episodios recientes"
            subtitle="Últimos capítulos agregados a nuestro catálogo"
          />
        </Container>

        {/* Popular Anime Section */}
        <Container className="py-8">
          <AnimeGrid
            animes={mockAnimes}
            title="Animes Populares"
            subtitle="Los más vistos por nuestra comunidad"
            viewAllLink="/browse?sort=popular"
          />
        </Container>

        {/* Season Anime Section */}
        <Container className="py-8">
          <AnimeGrid
            animes={mockSeasonAnimes}
            title="Temporada Actual"
            subtitle="Animes de la temporada en emisión"
            viewAllLink="/browse?season=current"
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
              <div className="flex flex-wrap gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  Primary
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                  Secondary
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                  Background
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--success)', color: '#fff' }}>
                  Success
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--error)', color: '#fff' }}>
                  Error
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>

        {/* UI Components Demo */}
        <Container className="py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>Componentes UI</h2>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Demostración de todos los componentes</p>
          </div>

          <Tabs defaultValue="buttons" className="mb-8">
            <TabsList>
              <TabsTrigger value="buttons">Botones</TabsTrigger>
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="misc">Otros</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons">
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inputs">
              <Card>
                <CardContent className="space-y-4 max-w-md">
                  <Input label="Email" placeholder="tu@email.com" />
                  <Input label="Con error" placeholder="..." error="Este campo es requerido" />
                  <SearchBar onSearch={(q) => console.log('Search:', q)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card hover onClick={() => console.log('clicked')}>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Card Clickeable</h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Esta card tiene efecto hover y es clickeable.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Card Normal</h3>
                    <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Una card simple sin efectos especiales.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center">
                    <SkeletonCard />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="misc">
              <Card>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="error">Error</Badge>
                      <Badge variant="info">Info</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>Avatars</h4>
                    <div className="flex items-center gap-4">
                      <Avatar size="sm" fallback="AB" />
                      <Avatar size="md" fallback="CD" />
                      <Avatar size="lg" fallback="EF" />
                      <Avatar size="xl" fallback="GH" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>Modal</h4>
                    <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>Skeleton</h4>
                    <div className="space-y-2 max-w-md">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>

        {/* Video Player Demo */}
        <Container className="py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>Video Player</h2>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Reproductor con selector de servidores</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VideoPlayer
                servers={mockServers}
                title="One Piece"
                episodeNumber={selectedEpisode}
              />
            </div>
            <div>
              <EpisodeList
                episodes={mockEpisodes}
                currentEpisode={selectedEpisode}
                onSelectEpisode={(ep) => setSelectedEpisode(ep.number)}
              />
            </div>
          </div>
        </Container>

        {/* Loading State Demo */}
        <Container className="py-8">
          <AnimeGrid
            animes={[]}
            isLoading
            skeletonCount={6}
            title="Estado de Carga"
            subtitle="Así se ve mientras carga el contenido"
          />
        </Container>
      </main>

      <Footer />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal de Ejemplo">
        <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
          Este es un modal de ejemplo. Puedes cerrarlo con Escape o haciendo click fuera.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
        </div>
      </Modal>

      {/* Theme Selector Modal */}
      <Modal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} title="Selector de Temas" size="lg">
        <ThemeSelector onClose={() => setThemeModalOpen(false)} />
      </Modal>
    </div>
  );
}
