import { useCallback, useSyncExternalStore } from 'react';

/**
 * matchMedia is external state, so it is read through useSyncExternalStore
 * rather than mirrored into useState from an effect — that avoids the
 * cascading render on mount and stays correct if the query changes.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // No SSR in this app; the server snapshot just keeps the API honest.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const useIsMobile = () => useMediaQuery('(max-width: 760px)');
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
