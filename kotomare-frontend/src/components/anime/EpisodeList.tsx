'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';

interface Episode {
  id: string;
  number: number;
  url: string;
  title?: string;
  thumbnail?: string;
}

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisode?: number;
  onSelectEpisode: (episode: Episode) => void;
  className?: string;
}

export function EpisodeList({ episodes, currentEpisode, onSelectEpisode, className = '' }: EpisodeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredEpisodes = episodes
    .filter((ep) => ep.number.toString().includes(searchQuery))
    .sort((a, b) => (sortOrder === 'asc' ? a.number - b.number : b.number - a.number));

  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--background-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="p-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Episodios ({episodes.length})
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-24 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary)',
              } as React.CSSProperties}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Episode Grid */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {filteredEpisodes.map((episode) => {
            const isSelected = currentEpisode === episode.number;
            return (
              <button
                key={episode.id}
                onClick={() => onSelectEpisode(episode)}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--background-tertiary)',
                  color: isSelected ? 'var(--primary-foreground)' : 'var(--foreground-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--background-tertiary)';
                    e.currentTarget.style.color = 'var(--foreground-secondary)';
                  }
                }}
              >
                {episode.number}
              </button>
            );
          })}
        </div>

        {filteredEpisodes.length === 0 && (
          <p
            className="text-center py-8"
            style={{ color: 'var(--foreground-muted)' }}
          >
            No se encontraron episodios
          </p>
        )}
      </div>
    </div>
  );
}
