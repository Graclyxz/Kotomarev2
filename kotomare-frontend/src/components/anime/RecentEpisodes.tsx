'use client';

import Image from 'next/image';
import Link from 'next/link';

interface RecentEpisode {
  id: string;
  animeId: number;
  animeSlug: string;
  animeTitle: string;
  animeCover: string;
  episodeNumber: number;
  episodeTitle?: string;
  thumbnail?: string;
  rating?: string;
  type?: string; // TV, Película, OVA, ONA, Especial
}

interface RecentEpisodesProps {
  episodes: RecentEpisode[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RecentEpisodes({
  episodes,
  title = 'Episodios recientes',
  subtitle = 'Últimos capítulos agregados a nuestro catálogo',
  className = '',
}: RecentEpisodesProps) {
  if (episodes.length === 0) return null;

  return (
    <section className={className}>
      {/* Section Header */}
      <div className="mb-6">
        <h2
          className="text-2xl md:text-3xl font-bold mb-1"
          style={{ color: 'var(--primary)' }}
        >
          {title}
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {subtitle}
        </p>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-5">
        {episodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/anime/${episode.animeSlug}/episode/${episode.episodeNumber}`}
            className="group block"
          >
            {/* Thumbnail */}
            <div
              className="relative aspect-[16/10] rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <Image
                src={episode.thumbnail || episode.animeCover}
                alt={`${episode.animeTitle} - Ep. ${episode.episodeNumber}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              {/* Hover overlay with play icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <svg
                    className="w-5 h-5 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--primary-foreground)' }}
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Episode number badge */}
              <div
                className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                }}
              >
                Ep. {episode.episodeNumber}
              </div>

              {/* Type badge (top left) */}
              {episode.type && (
                <div
                  className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  {episode.type}
                </div>
              )}

              {/* Rating badge (top right) */}
              {episode.rating && (
                <div
                  className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                  }}
                >
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {episode.rating}
                </div>
              )}
            </div>

            {/* Title */}
            <h3
              className="text-sm font-medium line-clamp-2 transition-colors mt-1"
              style={{ color: 'var(--primary)' }}
            >
              {episode.animeTitle}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
