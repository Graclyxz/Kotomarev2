interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--background-secondary)',
        border: '1px solid var(--border)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
        }
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`p-4 ${className}`}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`p-4 ${className}`}
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {children}
    </div>
  );
}
