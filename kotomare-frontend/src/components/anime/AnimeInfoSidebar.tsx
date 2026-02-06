import { Card, CardContent, Badge } from '@/components/ui';
import { ExternalLinkIcon, PlayIcon } from '@/components/ui/Icons';
import { AniListAnime } from '@/lib/api';

// Constants for translations
const STATUS_MAP: Record<string, string> = {
  FINISHED: 'Finalizado',
  RELEASING: 'En emisión',
  NOT_YET_RELEASED: 'Próximamente',
  CANCELLED: 'Cancelado',
  HIATUS: 'En pausa',
};

const FORMAT_MAP: Record<string, string> = {
  TV: 'Serie TV',
  TV_SHORT: 'TV Corto',
  MOVIE: 'Película',
  SPECIAL: 'Especial',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Música',
};

export function translateStatus(status: string | null): string {
  return status ? STATUS_MAP[status] || status : 'Desconocido';
}

export function translateFormat(format: string | null): string {
  return format ? FORMAT_MAP[format] || format : 'Desconocido';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Desconocido';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: 'var(--foreground)' }}>{value}</span>
    </div>
  );
}

interface AnimeInfoSidebarProps {
  anime: AniListAnime;
}

export function AnimeInfoSidebar({ anime }: AnimeInfoSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Información
          </h3>

          <div className="space-y-3">
            {/* Titles */}
            {anime.titles?.romaji && (
              <InfoRow label="Título Romaji" value={anime.titles.romaji} />
            )}
            {anime.titles?.english && anime.titles.english !== anime.title && (
              <InfoRow label="Título Inglés" value={anime.titles.english} />
            )}
            {anime.titles?.native && (
              <InfoRow label="Título Nativo" value={anime.titles.native} />
            )}

            <div className="border-t my-4" style={{ borderColor: 'var(--border)' }} />

            {/* Basic Info */}
            <InfoRow label="Formato" value={translateFormat(anime.format)} />
            <InfoRow label="Estado" value={translateStatus(anime.status)} />
            {anime.episodes_count && (
              <InfoRow label="Episodios" value={String(anime.episodes_count)} />
            )}
            {anime.metadata?.duration && (
              <InfoRow label="Duración" value={`${anime.metadata.duration} min`} />
            )}

            <div className="border-t my-4" style={{ borderColor: 'var(--border)' }} />

            {/* Dates */}
            {anime.season && anime.season_year && (
              <InfoRow label="Temporada" value={`${anime.season} ${anime.season_year}`} />
            )}
            {anime.metadata?.start_date && (
              <InfoRow label="Inicio" value={formatDate(anime.metadata.start_date)} />
            )}
            {anime.metadata?.end_date && (
              <InfoRow label="Fin" value={formatDate(anime.metadata.end_date)} />
            )}

            <div className="border-t my-4" style={{ borderColor: 'var(--border)' }} />

            {/* Stats */}
            {anime.average_score && (
              <InfoRow label="Puntuación" value={`${anime.average_score}%`} />
            )}
            {anime.popularity && (
              <InfoRow label="Popularidad" value={`#${anime.popularity.toLocaleString()}`} />
            )}
            {anime.metadata?.favourites && (
              <InfoRow label="Favoritos" value={anime.metadata.favourites.toLocaleString()} />
            )}

            {/* Source */}
            {anime.metadata?.source && (
              <>
                <div className="border-t my-4" style={{ borderColor: 'var(--border)' }} />
                <InfoRow label="Fuente" value={anime.metadata.source} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Studios */}
      {anime.studios && anime.studios.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Estudios
            </h3>
            <div className="flex flex-wrap gap-2">
              {anime.studios.map((studio, index) => (
                <Badge
                  key={`${studio.id}-${index}`}
                  variant={studio.is_animation_studio ? 'info' : 'default'}
                >
                  {studio.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {anime.tags && anime.tags.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {anime.tags.slice(0, 15).map((tag) => (
                <span
                  key={tag.name}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--foreground-secondary)',
                  }}
                >
                  {tag.name}
                  {tag.rank > 0 && (
                    <span className="ml-1 opacity-60">{tag.rank}%</span>
                  )}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* External Links */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Enlaces externos
          </h3>
          <div className="space-y-2">
            <a
              href={`https://anilist.co/anime/${anime.anilist_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-[var(--background-secondary)]"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              <ExternalLinkIcon />
              <span>AniList</span>
            </a>
            {anime.mal_id && (
              <a
                href={`https://myanimelist.net/anime/${anime.mal_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-[var(--background-secondary)]"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                <ExternalLinkIcon />
                <span>MyAnimeList</span>
              </a>
            )}
            {anime.metadata?.trailer_id && anime.metadata.trailer_site === 'youtube' && (
              <a
                href={`https://www.youtube.com/watch?v=${anime.metadata.trailer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-[var(--background-secondary)]"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                <PlayIcon className="w-4 h-4" />
                <span>Ver Trailer</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
