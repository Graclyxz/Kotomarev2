import Image from 'next/image';
import { Card } from '@/components/ui';

interface Person {
  image: string | null;
  name: string;
  subtitle: string;
}

interface PersonCardProps {
  person: Person;
  secondaryPerson?: Person;
  size?: 'sm' | 'md';
}

export function PersonCard({ person, secondaryPerson, size = 'md' }: PersonCardProps) {
  const imageSize = size === 'sm' ? 'w-12 h-12' : 'w-14 h-14';

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {/* Primary person */}
        <div className="flex items-center gap-3 flex-1 p-3">
          <div
            className={`relative ${imageSize} rounded-lg overflow-hidden shrink-0`}
            style={{ backgroundColor: 'var(--background-secondary)' }}
          >
            {person.image && (
              <Image src={person.image} alt={person.name} fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
              {person.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {person.subtitle}
            </p>
          </div>
        </div>

        {/* Secondary person (e.g., voice actor) */}
        {secondaryPerson && (
          <div className="flex items-center gap-3 flex-1 p-3 border-l" style={{ borderColor: 'var(--border)' }}>
            <div className="min-w-0 text-right flex-1">
              <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {secondaryPerson.name}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                {secondaryPerson.subtitle}
              </p>
            </div>
            <div
              className={`relative ${imageSize} rounded-lg overflow-hidden shrink-0`}
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              {secondaryPerson.image && (
                <Image src={secondaryPerson.image} alt={secondaryPerson.name} fill className="object-cover" />
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
