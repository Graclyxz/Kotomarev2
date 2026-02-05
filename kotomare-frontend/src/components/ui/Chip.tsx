'use client';

type ChipVariant = 'primary' | 'success' | 'secondary' | 'error';

interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const variantStyles: Record<ChipVariant, { bg: string; color: string; border: string }> = {
  primary: {
    bg: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: 'var(--primary)',
  },
  success: {
    bg: 'var(--success)',
    color: 'white',
    border: 'var(--success)',
  },
  secondary: {
    bg: 'var(--background)',
    color: 'var(--foreground-secondary)',
    border: 'var(--border)',
  },
  error: {
    bg: 'var(--error)',
    color: 'white',
    border: 'var(--error)',
  },
};

export function Chip({
  children,
  variant = 'primary',
  onRemove,
  onClick,
  selected,
  className = '',
}: ChipProps) {
  const styles = selected
    ? variantStyles[variant]
    : variantStyles.secondary;

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
          type="button"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
