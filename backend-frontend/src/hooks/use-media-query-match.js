import { useCallback, useSyncExternalStore } from 'react';

export { useMediaQueryMatch };

// -------------------------------------------------------------------
// Subscribes to a CSS media query via useSyncExternalStore — the
// idiomatic way to read external browser state without syncing it
// into React state from an effect.
// Server snapshot returns true (large screen), matching the
// prerendered HTML; the client corrects it on hydration if needed.
// -------------------------------------------------------------------
function useMediaQueryMatch(query) {
  const subscribe = useCallback((onChange) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true
  );
}
