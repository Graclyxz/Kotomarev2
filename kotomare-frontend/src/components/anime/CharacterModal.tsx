'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Modal, Badge, Skeleton } from '@/components/ui';
import { anilistApi, CharacterDetail } from '@/lib/api';

function SpoilerText({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }}
      className="rounded px-1 cursor-pointer transition-colors inline"
      style={{
        backgroundColor: revealed ? 'transparent' : 'var(--foreground-secondary)',
        color: revealed ? 'var(--foreground-secondary)' : 'transparent',
      }}
    >
      {text}
    </span>
  );
}

function parseDescriptionLine(line: string, lineIndex: number): React.ReactNode {
  if (line.trim() === '') return <span key={lineIndex} className="block h-2" />;

  // Split by spoilers first, then parse markdown in each segment
  const parts: React.ReactNode[] = [];
  const spoilerRegex = /~!([\s\S]*?)!~/g;
  let lastIndex = 0;
  let match;
  let partKey = 0;

  while ((match = spoilerRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...parseMarkdown(line.slice(lastIndex, match.index), lineIndex, partKey));
      partKey += 10;
    }
    parts.push(<SpoilerText key={`${lineIndex}-sp-${partKey}`} text={match[1]} />);
    partKey++;
    lastIndex = spoilerRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(...parseMarkdown(line.slice(lastIndex), lineIndex, partKey));
  }

  return <p key={lineIndex}>{parts}</p>;
}

function parseMarkdown(text: string, lineIndex: number, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /__(.*?)__/g;
  let lastIndex = 0;
  let match;
  let key = startKey;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`${lineIndex}-t-${key++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <strong key={`${lineIndex}-b-${key++}`} style={{ color: 'var(--foreground)' }}>
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`${lineIndex}-t-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return parts;
}

interface CharacterModalProps {
  characterId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterModal({ characterId, isOpen, onClose }: CharacterModalProps) {
  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !characterId) {
      setCharacter(null);
      setError(null);
      return;
    }

    const fetchCharacter = async () => {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await anilistApi.getCharacter(characterId);
      if (apiError) {
        setError(apiError);
      } else if (data) {
        setCharacter(data.character);
      }
      setLoading(false);
    };

    fetchCharacter();
  }, [isOpen, characterId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      {loading ? (
        <div className="flex gap-6">
          <Skeleton className="w-48 h-64 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-16 w-28 rounded-lg" />
              <Skeleton className="h-16 w-28 rounded-lg" />
              <Skeleton className="h-16 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      ) : character ? (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Imagen */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div
              className="relative w-48 h-64 rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              {character.image && (
                <Image
                  src={character.image}
                  alt={character.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            {/*character.favourites != null && (
              <p className="text-center text-sm mt-2" style={{ color: 'var(--foreground-secondary)' }}>
                {character.favourites.toLocaleString()} favoritos
              </p>
            )*/}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Nombres */}
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                {character.name}
              </h2>
              {character.name_native && (
                <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  {character.name_native}
                </p>
              )}
              {character.name_alternative.length > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                  {character.name_alternative.join(', ')}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {character.gender && (
                <Badge variant="info">{character.gender}</Badge>
              )}
              {character.age && (
                <Badge variant="default">{character.age} anos</Badge>
              )}
              {character.blood_type && (
                <Badge variant="warning">Sangre {character.blood_type}</Badge>
              )}
              {character.date_of_birth && (
                <Badge variant="success">{character.date_of_birth}</Badge>
              )}
            </div>

            {/* Descripcion */}
            {character.description && (
              <div
                className="text-sm leading-relaxed max-h-48 overflow-y-auto pr-2"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {character.description.split('\n').map((line, i) => parseDescriptionLine(line, i))}
              </div>
            )}

            {/* Apariciones en media */}
            {character.media.length > 0 && (
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Apariciones ({character.media.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                  {character.media.map((m) => (
                    <Link
                      key={m.id}
                      href={`/anime/${m.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--background-secondary)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--background-tertiary)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')
                      }
                    >
                      <div
                        className="relative w-10 h-14 rounded overflow-hidden shrink-0"
                        style={{ backgroundColor: 'var(--background-tertiary)' }}
                      >
                        {m.cover_image && (
                          <Image
                            src={m.cover_image}
                            alt={m.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {m.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                          {m.role}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
