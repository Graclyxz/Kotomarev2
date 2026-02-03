interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse ${variantStyles[variant]} ${className}`}
      style={{
        width,
        height,
        backgroundColor: 'var(--background-tertiary)',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
