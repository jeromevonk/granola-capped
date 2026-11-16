import { useEffect, type RefObject } from 'react';

export { useRepaintOnKeyboardClose };

// -------------------------------------------------------------------
// Works around an Android Chrome paint bug seen on ExpenseForm: with
// the focus on a numeric field, closing the on-screen keyboard left
// everything below the field unpainted (blank) until the screen was
// touched. The content is there — it just isn't redrawn.
//
// The visual viewport grows when the keyboard closes; at that point
// promote the element to its own compositing layer for a couple of
// frames and drop it again, which forces Chrome to re-raster it.
// A second pass after the keyboard animation settles covers the case
// where the first one ran mid-animation.
// -------------------------------------------------------------------
const SETTLE_MS = 300;

function useRepaintOnKeyboardClose(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    let lastHeight = viewport.height;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const repaint = () => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = 'translateZ(0)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = '';
        });
      });
    };

    const onResize = () => {
      const grew = viewport.height > lastHeight;
      lastHeight = viewport.height;
      if (!grew) return;

      repaint();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(repaint, SETTLE_MS);
    };

    viewport.addEventListener('resize', onResize);
    return () => {
      viewport.removeEventListener('resize', onResize);
      clearTimeout(settleTimer);
    };
  }, [ref]);
}
