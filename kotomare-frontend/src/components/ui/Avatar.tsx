import Image from 'next/image';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', pixels: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', pixels: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', pixels: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', pixels: 64 },
};

export function Avatar({ src, alt = 'Avatar', size = 'md', fallback, className = '' }: AvatarProps) {
  const { container, text, pixels } = sizeStyles[size];
  const initials = fallback?.slice(0, 2).toUpperCase() || '?';

  if (src) {
    return (
      <div className={`relative ${container} rounded-full overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          width={pixels}
          height={pixels}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full flex items-center justify-center ${text} font-medium ${className}`}
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
      }}
    >
      {initials}
    </div>
  );
}
