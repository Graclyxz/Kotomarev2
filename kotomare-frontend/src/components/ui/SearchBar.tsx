'use client';

import { useState, FormEvent } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = 'Buscar anime...',
  onSearch,
  className = '',
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
        style={{
          backgroundColor: 'var(--background-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          '--tw-ring-color': 'var(--primary)',
        } as React.CSSProperties}
      />
      <button
        type="submit"
        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: 'var(--foreground-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
}
