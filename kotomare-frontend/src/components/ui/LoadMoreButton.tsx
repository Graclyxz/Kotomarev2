import { Button } from './Button';

interface LoadMoreButtonProps {
  count: number;
  label: string;
  hasNext: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function LoadMoreButton({ count, label, hasNext, loading, onLoadMore }: LoadMoreButtonProps) {
  return (
    <div className="text-center py-4 mt-4">
      <p className="text-sm mb-2" style={{ color: 'var(--foreground-secondary)' }}>
        {count} {label} cargados
      </p>
      {hasNext && (
        <Button
          variant="secondary"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Cargando...' : `Cargar más ${label}`}
        </Button>
      )}
    </div>
  );
}
