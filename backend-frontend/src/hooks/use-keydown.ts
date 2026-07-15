import { useEffect } from 'react';

export { useKeydown };

// -------------------------------------------------------------------
// Global keyboard-shortcut subscription. State updates happen inside
// the event callback (a subscription), never in the effect body, so
// this replaces the old useKeyPress + "react to boolean in an effect"
// pattern without cascading renders.
// Pass enabled=false to suspend (e.g. while the search bar is focused).
// -------------------------------------------------------------------
function useKeydown(onKeyDown: (event: KeyboardEvent) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      // holding a key down must not repeat the action
      if (event.repeat) return;
      onKeyDown(event);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKeyDown, enabled]);
}
