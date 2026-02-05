import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Badge } from '@/components/ui';
import { StarIcon } from '@/components/ui/Icons';

interface AnimeCardMiniProps {
  id: number;
  title: string;
  coverImage: string | null;
  badge?: string;
  score?: number;
  format?: string;
  showScore?: boolean;
}

export function AnimeCardMini({
  id,
  title,
  coverImage,
  badge,
  score,
  format,
  showScore = false,
}: AnimeCardMiniProps) {
  return (
    <Link href={`/anime/${id}`} className="group block">
      <Card className="overflow-hidden">
        <div className="relative aspect-[2/3]" style={{ backgroundColor: 'var(--background-secondary)' }}>
          {coverImage && (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          )}
          {badge && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="bg-black/60 backdrop-blur-sm text-xs">
                {badge}
              </Badge>
            </div>
          )}
          {showScore && score && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
              <StarIcon className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-white">{(score / 10).toFixed(1)}</span>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <p className="text-sm font-medium line-clamp-2" style={{ color: 'var(--foreground)' }}>
            {title}
          </p>
          {format && (
            <p className="text-xs mt-1" style={{ color: 'var(--foreground-secondary)' }}>
              {format}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Simplified version for recommendations
interface RecommendationCardProps {
  id: number;
  title: string;
  coverImage: string | null;
  score?: number;
}

export function RecommendationCard({ id, title, coverImage, score }: RecommendationCardProps) {
  return (
    <Link href={`/anime/${id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--background-secondary)' }}>
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        )}
        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5">
            <StarIcon className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-white">{(score / 10).toFixed(1)}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-medium line-clamp-2" style={{ color: 'var(--foreground-secondary)' }}>
        {title}
      </p>
    </Link>
  );
}
