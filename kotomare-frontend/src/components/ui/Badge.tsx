type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--background-tertiary)', color: 'var(--foreground-secondary)' },
  success: { bg: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)' },
  warning: { bg: 'rgba(234, 179, 8, 0.2)', color: 'var(--warning)' },
  error: { bg: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' },
  info: { bg: 'rgba(59, 130, 246, 0.2)', color: 'var(--info)' },
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
      }}
    >
      {children}
    </span>
  );
}
