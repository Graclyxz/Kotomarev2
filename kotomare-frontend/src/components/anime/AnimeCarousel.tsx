'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface CarouselItem {
  id: number;
  slug: string;
  title: string;
  coverImage: string;
  bannerImage?: string;
  synopsis?: string;
  type?: string;
  rating?: string;
  genres?: string[];
  year?: number;
  status?: string;
}

interface AnimeCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function AnimeCarousel({ items, autoPlay = true, interval = 6000, className = '' }: AnimeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const next = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [items.length, isTransitioning]);

  const prev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [items.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next, items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main Hero Section */}
      <div className="relative h-[500px] md:h-[550px] lg:h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentItem.bannerImage || currentItem.coverImage}
            alt={currentItem.title}
            fill
            className="object-cover object-center transition-all duration-700"
            priority
            sizes="100vw"
          />

          {/* Gradient overlay - only on left side for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.5) 35%, transparent 70%)',
            }}
          />

          {/* Bottom gradient - always dark for consistent look */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, #0a0a0a 0%, transparent 25%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl lg:max-w-2xl z-10">
            {/* Genres/Tags */}
            {currentItem.genres && currentItem.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {currentItem.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
              style={{
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              {currentItem.title}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 mb-4 text-gray-300 text-sm">
              {currentItem.year && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {currentItem.year}
                </span>
              )}
              {currentItem.type && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  {currentItem.type}
                </span>
              )}
              {currentItem.rating && parseFloat(currentItem.rating) > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {currentItem.rating}
                </span>
              )}
              {currentItem.status && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: currentItem.status === 'En emisión' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: currentItem.status === 'En emisión' ? '#22c55e' : '#3b82f6',
                  }}
                >
                  {currentItem.status}
                </span>
              )}
            </div>

            {/* Synopsis */}
            {currentItem.synopsis && (
              <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-6 leading-relaxed">
                {currentItem.synopsis}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href={`/anime/${currentItem.slug}`}>
                <Button size="lg" className="group">
                  <svg className="w-5 h-5 mr-1 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Ver ahora
                </Button>
              </Link>
              <Link href={`/anime/${currentItem.slug}`}>
                <Button variant="ghost" size="lg" className="text-white border border-white/30 hover:bg-white/10">
                  <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Más info
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 backdrop-blur-sm"
              style={{ opacity: 0.7 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-all backdrop-blur-sm"
              style={{ opacity: 0.7 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator - Centered at bottom */}
        {items.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all duration-300"
                aria-label={`Go to slide ${index + 1}`}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: index === currentIndex ? '24px' : '8px',
                    height: '8px',
                    backgroundColor: index === currentIndex ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
