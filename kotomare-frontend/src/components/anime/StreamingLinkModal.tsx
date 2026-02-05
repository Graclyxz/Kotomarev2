'use client';

import Image from 'next/image';
import { Modal, Button } from '@/components/ui';
import { SearchIcon } from '@/components/ui/Icons';
import { AnimeFLVSearchResult } from '@/lib/api';

interface StreamingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  searching: boolean;
  searchResults: AnimeFLVSearchResult[];
  onLink: (result: AnimeFLVSearchResult) => void;
  linking: boolean;
}

export function StreamingLinkModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searching,
  searchResults,
  onLink,
  linking,
}: StreamingLinkModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular fuente de streaming"
      size="lg"
    >
      <div className="space-y-4">
        <p style={{ color: 'var(--foreground-secondary)' }}>
          Busca el anime en AnimeFLV para vincular los episodios.
        </p>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Buscar en AnimeFLV..."
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <Button variant="primary" onClick={onSearch} disabled={searching}>
            {searching ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <SearchIcon />
            )}
          </Button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--background-secondary)]"
                style={{ border: '1px solid var(--border)' }}
                onClick={() => !linking && onLink(result)}
              >
                <div
                  className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: 'var(--background-secondary)' }}
                >
                  {result.cover_image && (
                    <Image src={result.cover_image} alt={result.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {result.title}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    {result.type} {result.rating && `• ${result.rating}`}
                  </p>
                </div>
                <Button variant="secondary" size="sm" disabled={linking}>
                  {linking ? 'Vinculando...' : 'Vincular'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !searching && searchQuery && (
          <p className="text-center py-4" style={{ color: 'var(--foreground-secondary)' }}>
            Haz clic en buscar para encontrar resultados
          </p>
        )}
      </div>
    </Modal>
  );
}
