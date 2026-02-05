'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import {
  AnimeHero,
  EpisodeList,
  PersonCard,
  AnimeCardMini,
  RecommendationCard,
  StreamingLinkModal,
  AnimeInfoSidebar,
  translateStatus,
  translateFormat,
} from '@/components/anime';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  LoadMoreButton,
  EmptyState,
  UsersIcon,
  MicIcon,
  LinkIcon,
  ErrorIcon,
} from '@/components/ui';
import { anilistApi, scrapeApi, localApi, AniListAnime, AnimeFLVSearchResult, Episode } from '@/lib/api';
import { VOICE_LANGUAGES, LANGUAGE_LABELS } from '@/hooks/usePaginatedData';

export default function AnimePage() {
  const params = useParams();
  const animeId = Number(params.id);

  // Core state
  const [anime, setAnime] = useState<AniListAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Streaming state
  const [hasStreaming, setHasStreaming] = useState(false);
  const [streamingSources, setStreamingSources] = useState<string[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeFLVSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);

  // Pagination state
  const [charactersPage, setCharactersPage] = useState(1);
  const [charactersHasNext, setCharactersHasNext] = useState(false);
  const [loadingMoreCharacters, setLoadingMoreCharacters] = useState(false);
  const [staffPage, setStaffPage] = useState(1);
  const [staffHasNext, setStaffHasNext] = useState(false);
  const [loadingMoreStaff, setLoadingMoreStaff] = useState(false);

  // Voice actors state
  const [voiceLanguage, setVoiceLanguage] = useState('JAPANESE');
  const [voiceActors, setVoiceActors] = useState<Array<{
    id: number;
    name: string;
    image: string | null;
    language: string;
    characters: Array<{ name: string; image: string | null; role: string }>;
  }>>([]);
  const [voiceActorsPage, setVoiceActorsPage] = useState(1);
  const [voiceActorsHasNext, setVoiceActorsHasNext] = useState(false);
  const [loadingVoiceActors, setLoadingVoiceActors] = useState(false);

  // Load anime data
  useEffect(() => {
    if (!animeId) return;

    const loadAnime = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: apiError } = await anilistApi.getAnimeFull(animeId);

        if (apiError) {
          setError(apiError);
          return;
        }

        if (data?.anime) {
          setAnime(data.anime);
          setSearchQuery(data.anime.title);
          const pagination = (data.anime as unknown as { _pagination?: { characters?: { has_next: boolean }; staff?: { has_next: boolean } } })._pagination;
          if (pagination) {
            setCharactersHasNext(pagination.characters?.has_next || false);
            setStaffHasNext(pagination.staff?.has_next || false);
          }
        }

        const { data: checkData } = await localApi.checkAnime(animeId);
        if (checkData) {
          setHasStreaming(checkData.has_streaming);
          setStreamingSources(checkData.sources || []);

          if (checkData.has_streaming && checkData.sources?.length > 0) {
            loadEpisodes(checkData.sources[0]);
          }
        }
      } catch {
        setError('Error al cargar el anime');
      } finally {
        setLoading(false);
      }
    };

    loadAnime();
  }, [animeId]);

  // Load episodes
  const loadEpisodes = async (source: string) => {
    setLoadingEpisodes(true);
    try {
      const { data } = await localApi.getAnimeEpisodes(animeId, source);
      if (data) {
        setEpisodes(data.episodes);
      }
    } finally {
      setLoadingEpisodes(false);
    }
  };

  // Search AnimeFLV
  const searchAnimeFLV = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await scrapeApi.searchAnimeFLV(searchQuery);
      if (data) setSearchResults(data.results);
    } finally {
      setSearching(false);
    }
  };

  // Link with AnimeFLV
  const linkWithAnimeFLV = async (animeflvResult: AnimeFLVSearchResult) => {
    if (!anime) return;
    setLinking(true);
    try {
      const { data, error: linkError } = await scrapeApi.linkAnimeFLV({
        anilist_id: anime.anilist_id,
        title: anime.title,
        cover_image: anime.cover_image || undefined,
        animeflv_id: animeflvResult.id,
      });

      if (data) {
        setHasStreaming(true);
        setStreamingSources(['animeflv']);
        setEpisodes(data.anime.episodes || []);
        setLinkModalOpen(false);
      } else if (linkError) {
        alert('Error al vincular: ' + linkError);
      }
    } finally {
      setLinking(false);
    }
  };

  // Handle episode selection
  const handleSelectEpisode = (episode: Episode & { url?: string }) => {
    console.log('Seleccionado episodio:', episode);
  };

  // Load more characters
  const loadMoreCharacters = async () => {
    if (!anime || loadingMoreCharacters || !charactersHasNext) return;
    setLoadingMoreCharacters(true);
    try {
      const nextPage = charactersPage + 1;
      const { data } = await anilistApi.getCharacters(animeId, nextPage);
      if (data?.characters) {
        setAnime(prev => prev ? { ...prev, characters: [...(prev.characters || []), ...data.characters!] } : prev);
        setCharactersPage(nextPage);
        setCharactersHasNext(data.has_next);
      }
    } finally {
      setLoadingMoreCharacters(false);
    }
  };

  // Load more staff
  const loadMoreStaff = async () => {
    if (!anime || loadingMoreStaff || !staffHasNext) return;
    setLoadingMoreStaff(true);
    try {
      const nextPage = staffPage + 1;
      const { data } = await anilistApi.getStaff(animeId, nextPage);
      if (data?.staff) {
        setAnime(prev => prev ? { ...prev, staff: [...(prev.staff || []), ...data.staff!] } : prev);
        setStaffPage(nextPage);
        setStaffHasNext(data.has_next);
      }
    } finally {
      setLoadingMoreStaff(false);
    }
  };

  // Load voice actors
  const loadVoiceActors = async (language: string, page: number = 1, append: boolean = false) => {
    setLoadingVoiceActors(true);
    try {
      const { data } = await anilistApi.getVoiceActors(animeId, language, page);
      if (data) {
        setVoiceActors(prev => append ? [...prev, ...data.voice_actors] : data.voice_actors);
        setVoiceActorsPage(data.page);
        setVoiceActorsHasNext(data.has_next);
      }
    } finally {
      setLoadingVoiceActors(false);
    }
  };

  // Load more voice actors
  const loadMoreVoiceActors = () => {
    if (!loadingVoiceActors && voiceActorsHasNext) {
      loadVoiceActors(voiceLanguage, voiceActorsPage + 1, true);
    }
  };

  // Change voice language
  const changeVoiceLanguage = (language: string) => {
    setVoiceLanguage(language);
    setVoiceActors([]);
    setVoiceActorsPage(1);
    loadVoiceActors(language, 1, false);
  };

  // Load initial voice actors
  useEffect(() => {
    if (anime?.anilist_id && !loading) {
      loadVoiceActors('JAPANESE', 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anime?.anilist_id, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen">
          <div className="relative h-[500px]" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
                <div className="flex gap-8">
                  <Skeleton className="w-56 h-80 rounded-xl" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-12 w-96" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-20 w-full max-w-2xl" />
                    <div className="flex gap-3">
                      <Skeleton className="h-12 w-32" />
                      <Skeleton className="h-12 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
              <div><Skeleton className="h-96 w-full rounded-xl" /></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !anime) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="py-12">
              <ErrorIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Anime no encontrado
              </h2>
              <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                {error || 'No se pudo cargar la información del anime'}
              </p>
              <Link href="/"><Button variant="primary">Volver al inicio</Button></Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        <AnimeHero
          title={anime.title}
          coverImage={anime.cover_image || '/placeholder-anime.jpg'}
          bannerImage={anime.banner_image || undefined}
          synopsis={anime.synopsis || undefined}
          type={translateFormat(anime.format)}
          status={translateStatus(anime.status)}
          genres={anime.genres}
          rating={anime.average_score ? String(anime.average_score / 10) : undefined}
          episodeCount={anime.episodes_count || undefined}
          onPlay={() => {
            if (hasStreaming && episodes.length > 0) {
              handleSelectEpisode(episodes[0] as Episode & { url?: string });
            } else {
              setLinkModalOpen(true);
            }
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Streaming Section */}
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Ver Episodios</h2>
                    <Badge variant={hasStreaming ? 'success' : 'warning'}>
                      {hasStreaming ? 'Disponible' : 'Sin vincular'}
                    </Badge>
                  </div>

                  {hasStreaming ? (
                    loadingEpisodes ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                      </div>
                    ) : episodes.length > 0 ? (
                      <EpisodeList episodes={episodes.map(ep => ({ ...ep, url: '' }))} onSelectEpisode={handleSelectEpisode} />
                    ) : (
                      <p style={{ color: 'var(--foreground-secondary)' }}>No hay episodios disponibles</p>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                        Este anime no tiene una fuente de streaming vinculada.
                      </p>
                      <Button variant="primary" onClick={() => setLinkModalOpen(true)}>
                        <LinkIcon />
                        Vincular con AnimeFLV
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="characters">
                <TabsList>
                  <TabsTrigger value="characters" icon={<UsersIcon />}>Personajes</TabsTrigger>
                  <TabsTrigger value="voice-actors" icon={<MicIcon />}>Voces</TabsTrigger>
                  <TabsTrigger value="staff" icon={<UsersIcon />}>Staff</TabsTrigger>
                  <TabsTrigger value="relations" icon={<LinkIcon />}>Relacionados</TabsTrigger>
                </TabsList>

                {/* Characters Tab */}
                <TabsContent value="characters">
                  {anime.characters && anime.characters.length > 0 ? (
                    <div className="max-h-[600px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {anime.characters.map((char, index) => {
                          const japaneseVA = char.voice_actors?.find(va => va.language === 'Japanese');
                          return (
                            <PersonCard
                              key={`${char.id}-${index}`}
                              person={{ image: char.image, name: char.name, subtitle: char.role }}
                              secondaryPerson={japaneseVA ? { image: japaneseVA.image, name: japaneseVA.name, subtitle: 'Japonés' } : undefined}
                            />
                          );
                        })}
                      </div>
                      <LoadMoreButton
                        count={anime.characters.length}
                        label="personajes"
                        hasNext={charactersHasNext}
                        loading={loadingMoreCharacters}
                        onLoadMore={loadMoreCharacters}
                      />
                    </div>
                  ) : (
                    <EmptyState message="No hay información de personajes disponible" />
                  )}
                </TabsContent>

                {/* Voice Actors Tab */}
                <TabsContent value="voice-actors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Idioma:</span>
                      {VOICE_LANGUAGES.map(lang => (
                        <button
                          key={lang.value}
                          onClick={() => changeVoiceLanguage(lang.value)}
                          className="px-3 py-1.5 text-sm rounded-full transition-colors"
                          style={{
                            backgroundColor: voiceLanguage === lang.value ? 'var(--primary)' : 'var(--background-secondary)',
                            color: voiceLanguage === lang.value ? 'var(--primary-foreground)' : 'var(--foreground-secondary)',
                          }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-2">
                      {loadingVoiceActors && voiceActors.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i}>
                              <div className="flex items-center gap-3 p-3">
                                <Skeleton className="w-14 h-14 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-3 w-16" />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : voiceActors.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {voiceActors.map((va, index) => (
                              <PersonCard
                                key={`${va.id}-${index}`}
                                person={{
                                  image: va.image,
                                  name: va.name,
                                  subtitle: va.characters.length === 1 ? va.characters[0].name : `${va.characters.length} personajes`,
                                }}
                              />
                            ))}
                          </div>
                          <LoadMoreButton
                            count={voiceActors.length}
                            label="actores"
                            hasNext={voiceActorsHasNext}
                            loading={loadingVoiceActors}
                            onLoadMore={loadMoreVoiceActors}
                          />
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p style={{ color: 'var(--foreground-secondary)' }}>
                            No hay actores de voz en {LANGUAGE_LABELS[voiceLanguage] || voiceLanguage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Staff Tab */}
                <TabsContent value="staff">
                  {anime.staff && anime.staff.length > 0 ? (
                    <div className="max-h-[600px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {anime.staff.map((member, index) => (
                          <PersonCard
                            key={`${member.id}-${member.role}-${index}`}
                            person={{ image: member.image, name: member.name, subtitle: member.role }}
                            size="sm"
                          />
                        ))}
                      </div>
                      <LoadMoreButton
                        count={anime.staff.length}
                        label="miembros"
                        hasNext={staffHasNext}
                        loading={loadingMoreStaff}
                        onLoadMore={loadMoreStaff}
                      />
                    </div>
                  ) : (
                    <EmptyState message="No hay información de staff disponible" />
                  )}
                </TabsContent>

                {/* Relations Tab */}
                <TabsContent value="relations">
                  {anime.relations && anime.relations.length > 0 ? (
                    <div className="max-h-[600px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {anime.relations.map((rel) => (
                          <AnimeCardMini
                            key={rel.id}
                            id={rel.id}
                            title={rel.title}
                            coverImage={rel.cover_image}
                            badge={rel.relation_type}
                            format={translateFormat(rel.format)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="No hay animes relacionados" />
                  )}
                </TabsContent>
              </Tabs>

              {/* Recommendations */}
              {anime.recommendations && anime.recommendations.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Recomendaciones</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {anime.recommendations.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        id={rec.id}
                        title={rec.title}
                        coverImage={rec.cover_image}
                        score={rec.average_score ?? undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <AnimeInfoSidebar anime={anime} />
          </div>
        </div>

        <StreamingLinkModal
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={searchAnimeFLV}
          searching={searching}
          searchResults={searchResults}
          onLink={linkWithAnimeFLV}
          linking={linking}
        />
      </div>
    </Layout>
  );
}
