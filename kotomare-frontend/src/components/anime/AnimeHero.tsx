'use client';

import Image from 'next/image';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

function genreColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsla(${hue}, 65%, 55%, 0.45)`;
}

const GENRE_COLORS: Record<string, string> = {
  Action: 'rgba(239, 68, 68, 0.45)',
  Adventure: 'rgba(249, 115, 22, 0.45)',
  Comedy: 'rgba(250, 204, 21, 0.4)',
  Drama: 'rgba(168, 85, 247, 0.45)',
  Ecchi: 'rgba(244, 114, 182, 0.4)',
  Fantasy: 'rgba(139, 92, 246, 0.45)',
  Horror: 'rgba(127, 29, 29, 0.55)',
  'Mahou Shoujo': 'rgba(236, 72, 153, 0.45)',
  Mecha: 'rgba(100, 116, 139, 0.5)',
  Music: 'rgba(34, 211, 238, 0.4)',
  Mystery: 'rgba(99, 102, 241, 0.45)',
  Psychological: 'rgba(109, 40, 217, 0.5)',
  Romance: 'rgba(251, 113, 133, 0.45)',
  'Sci-Fi': 'rgba(6, 182, 212, 0.45)',
  'Slice of Life': 'rgba(74, 222, 128, 0.4)',
  Sports: 'rgba(251, 146, 60, 0.45)',
  Supernatural: 'rgba(167, 139, 250, 0.45)',
  Thriller: 'rgba(220, 38, 38, 0.5)',
};

interface AnimeHeroProps {
  title: string;
  coverImage: string;
  bannerImage?: string;
  synopsis?: string;
  type?: string;
  status?: string;
  genres?: string[];
  rating?: string;
  episodeCount?: number;
  isFavorite?: boolean;
  inWatchlist?: boolean;
  onPlay?: () => void;
  onToggleFavorite?: () => void;
  onAddToWatchlist?: () => void;
}

export function AnimeHero({
  title,
  coverImage,
  bannerImage,
  synopsis,
  type,
  status,
  genres = [],
  rating,
  episodeCount,
  isFavorite,
  inWatchlist,
  onPlay,
  onToggleFavorite,
  onAddToWatchlist,
}: AnimeHeroProps) {
  const statusVariant = status === 'Finalizado' ? 'success' : status === 'En emisión' ? 'info' : 'default';

  return (
    <div className="relative">
      {/* Banner Background */}
      <div className="absolute inset-0 h-[500px]">
        <Image
          src={bannerImage || coverImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay - works well on both light and dark modes */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="relative w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info - Use white/light text since it's over dark overlay */}
          <div className="flex-1 text-center md:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
              {type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                  {type}
                </span>
              )}
              {status && <Badge variant={statusVariant}>{status}</Badge>}
              {episodeCount && <Badge variant="info">{episodeCount} episodios</Badge>}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
              {title}
            </h1>

            {/* Rating */}
            {rating && parseFloat(rating) > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xl font-semibold text-white">
                  {rating}
                </span>
                <span className="text-gray-300">/ 10</span>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm transition-colors hover:brightness-110"
                    style={{
                      backgroundColor: GENRE_COLORS[genre] || genreColorFromName(genre),
                      color: '#fff',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {synopsis && (
              <p className="max-w-2xl mb-6 max-h-28 overflow-y-auto text-gray-200 whitespace-pre-line pr-2">
                {synopsis.replace(/<br\s*\/?>/gi, '\n')}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button size="lg" onClick={onPlay}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Ver Ahora
              </Button>

              <Button
                variant={isFavorite ? 'primary' : 'secondary'}
                size="lg"
                onClick={onToggleFavorite}
              >
                <svg
                  className="w-5 h-5"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {isFavorite ? 'En Favoritos' : 'Favoritos'}
              </Button>

              <Button
                variant={inWatchlist ? 'primary' : 'ghost'}
                size="lg"
                onClick={onAddToWatchlist}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={inWatchlist ? 'M5 13l4 4L19 7' : 'M12 4v16m8-8H4'}
                  />
                </svg>
                {inWatchlist ? 'En Mi Lista' : 'Mi Lista'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
