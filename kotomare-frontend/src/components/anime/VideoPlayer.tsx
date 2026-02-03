'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface VideoServer {
  server: string;
  url: string;
  type: string;
  ads: number;
}

interface VideoPlayerProps {
  servers: VideoServer[];
  title?: string;
  episodeNumber?: number;
  isLoading?: boolean;
  className?: string;
}

export function VideoPlayer({ servers, title, episodeNumber, isLoading, className = '' }: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<VideoServer | null>(
    servers.length > 0 ? servers[0] : null
  );

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div
        className={`rounded-xl aspect-video flex items-center justify-center ${className}`}
        style={{
          backgroundColor: 'var(--background-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--foreground-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p style={{ color: 'var(--foreground-muted)' }}>No hay servidores disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Container */}
      <div className="relative bg-black rounded-xl overflow-hidden">
        {/* Title overlay */}
        {(title || episodeNumber) && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
            <p className="text-white font-medium">
              {title} {episodeNumber && `- Episodio ${episodeNumber}`}
            </p>
          </div>
        )}

        {/* Video iframe */}
        {selectedServer && (
          <iframe
            src={selectedServer.url}
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        )}
      </div>

      {/* Server selection */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-sm mr-2"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          Servidor:
        </span>
        {servers.map((server, index) => (
          <Button
            key={`${server.server}-${index}`}
            variant={selectedServer?.server === server.server && selectedServer?.url === server.url ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedServer(server)}
          >
            {server.server}
            {server.ads > 0 && (
              <span className="ml-1 text-xs opacity-70">({server.ads} ads)</span>
            )}
          </Button>
        ))}
      </div>

      {/* Server info */}
      {selectedServer && (
        <div
          className="flex items-center gap-4 text-sm"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <span>Tipo: {selectedServer.type}</span>
          {selectedServer.ads > 0 && (
            <span style={{ color: 'var(--warning)' }}>
              Contiene {selectedServer.ads} anuncio(s)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
