'use client';

import { useEffect } from 'react';

/**
 * Disables the browser's native scroll-position restoration and forces the
 * page to start at the very top on every hard reload or navigation.
 */
export default function ScrollToTop() {
  useEffect(() => {
    // Tell the browser not to restore the scroll position automatically
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Immediately jump to top (handles both hard reload and soft navigation)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return null;
}
