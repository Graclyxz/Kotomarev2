import { AnimeCard } from './AnimeCard';
import { SkeletonCard } from '../ui/Skeleton';
import { SectionHeader } from '../ui/SectionHeader';

interface Anime {
  id: number;
  slug: string;
  title: string;
  cover_image: string;
  type?: string;
  status?: string;
  sources?: {
    [key: string]: {
      rating?: string;
    };
  };
}

interface AnimeGridProps {
  animes: Anime[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  columns?: 'default' | 'compact' | 'wide';
}

export function AnimeGrid({
  animes,
  isLoading,
  skeletonCount = 12,
  className = '',
  title,
  subtitle,
  viewAllLink,
  columns = 'default',
}: AnimeGridProps) {
  const columnClasses = {
    default: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    compact: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7',
    wide: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5',
  };

  if (isLoading) {
    return (
      <div className={className}>
        {title && <SectionHeader title={title} subtitle={subtitle} viewAllLink={viewAllLink} />}
        <div className={`grid ${columnClasses[columns]} gap-5 md:gap-6`}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (animes.length === 0) {
    return (
      <div className={className}>
        {title && <SectionHeader title={title} subtitle={subtitle} viewAllLink={viewAllLink} />}
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-xl"
          style={{ backgroundColor: 'var(--background-secondary)' }}
        >
          <svg
            className="w-16 h-16 mb-4"
            style={{ color: 'var(--foreground-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p style={{ color: 'var(--foreground-muted)' }} className="text-lg">
            No se encontraron animes
          </p>
        </div>
      </div>
    );
  }

  // Get first source rating
  const getRating = (anime: Anime) => {
    if (!anime.sources) return undefined;
    const firstSource = Object.values(anime.sources)[0];
    return firstSource?.rating;
  };

  return (
    <div className={className}>
      {title && <SectionHeader title={title} subtitle={subtitle} viewAllLink={viewAllLink} />}
      <div className={`grid ${columnClasses[columns]} gap-5 md:gap-6`}>
        {animes.map((anime) => (
          <AnimeCard
            key={anime.id}
            id={anime.id}
            slug={anime.slug}
            title={anime.title}
            coverImage={anime.cover_image}
            type={anime.type}
            status={anime.status}
            rating={getRating(anime)}
          />
        ))}
      </div>
    </div>
  );
}
