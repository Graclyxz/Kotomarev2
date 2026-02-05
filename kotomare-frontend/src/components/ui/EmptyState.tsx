import { Card, CardContent } from './Card';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <p style={{ color: 'var(--foreground-secondary)' }}>{message}</p>
      </CardContent>
    </Card>
  );
}
