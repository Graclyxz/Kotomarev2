import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'Ver todo',
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between mb-6 ${className}`}>
      <div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-1"
          style={{ color: 'var(--primary)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-sm"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--primary)' }}
        >
          {viewAllText}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
