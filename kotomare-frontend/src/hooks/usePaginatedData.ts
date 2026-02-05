import { useState, useCallback } from 'react';

interface PaginatedState<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  loading: boolean;
}

interface UsePaginatedDataResult<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  loading: boolean;
  setItems: (items: T[]) => void;
  appendItems: (newItems: T[]) => void;
  setHasNext: (hasNext: boolean) => void;
  setLoading: (loading: boolean) => void;
  incrementPage: () => void;
  reset: () => void;
  loadMore: (fetcher: () => Promise<{ items: T[]; hasNext: boolean } | null>) => Promise<void>;
}

export function usePaginatedData<T>(initialItems: T[] = []): UsePaginatedDataResult<T> {
  const [state, setState] = useState<PaginatedState<T>>({
    items: initialItems,
    page: 1,
    hasNext: false,
    loading: false,
  });

  const setItems = useCallback((items: T[]) => {
    setState(prev => ({ ...prev, items }));
  }, []);

  const appendItems = useCallback((newItems: T[]) => {
    setState(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
  }, []);

  const setHasNext = useCallback((hasNext: boolean) => {
    setState(prev => ({ ...prev, hasNext }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const incrementPage = useCallback(() => {
    setState(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({ items: [], page: 1, hasNext: false, loading: false });
  }, []);

  const loadMore = useCallback(async (
    fetcher: () => Promise<{ items: T[]; hasNext: boolean } | null>
  ) => {
    if (state.loading || !state.hasNext) return;

    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await fetcher();
      if (result) {
        setState(prev => ({
          ...prev,
          items: [...prev.items, ...result.items],
          page: prev.page + 1,
          hasNext: result.hasNext,
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.loading, state.hasNext]);

  return {
    items: state.items,
    page: state.page,
    hasNext: state.hasNext,
    loading: state.loading,
    setItems,
    appendItems,
    setHasNext,
    setLoading,
    incrementPage,
    reset,
    loadMore,
  };
}

// Voice language options constant
export const VOICE_LANGUAGES = [
  { value: 'JAPANESE', label: 'Japonés' },
  { value: 'ENGLISH', label: 'Inglés' },
  { value: 'KOREAN', label: 'Coreano' },
  { value: 'SPANISH', label: 'Español' },
  { value: 'PORTUGUESE', label: 'Portugués' },
  { value: 'FRENCH', label: 'Francés' },
  { value: 'GERMAN', label: 'Alemán' },
  { value: 'ITALIAN', label: 'Italiano' },
] as const;

export const LANGUAGE_LABELS: Record<string, string> = {
  JAPANESE: 'Japonés',
  ENGLISH: 'Inglés',
  KOREAN: 'Coreano',
  SPANISH: 'Español',
  PORTUGUESE: 'Portugués',
  FRENCH: 'Francés',
  GERMAN: 'Alemán',
  ITALIAN: 'Italiano',
};
