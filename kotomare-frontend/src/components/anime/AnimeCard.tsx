'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/Badge';

interface AnimeCardProps {
  id: number;
  slug: string;
  title: string;
  coverImage: string;
  type?: string;
  status?: string;
  rating?: string;
  episodeCount?: number;
  className?: string;
}

export function AnimeCard({
  slug,
  title,
  coverImage,
  type,
  rating,
  className = '',
}: AnimeCardProps) {
  return (
    <Link href={`/anime/${slug}`} className={`group block ${className}`}>
      <div
        className="relative aspect-[2/3] rounded-lg overflow-hidden"
        style={{ backgroundColor: 'var(--background-secondary)' }}
      >
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg
              className="w-6 h-6 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--primary-foreground)' }}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {type && (
            <Badge variant="default" className="bg-black/60 backdrop-blur-sm">
              {type}
            </Badge>
          )}
        </div>

        {/* Rating */}
        {rating && parseFloat(rating) > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-white font-medium">{rating}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        className="mt-2 text-sm font-medium line-clamp-2 transition-colors"
        style={{ color: 'var(--foreground-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-secondary)')}
      >
        {title}
      </h3>
    </Link>
  );
}
