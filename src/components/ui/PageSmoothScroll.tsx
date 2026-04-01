'use client';

import { useEffect } from 'react';

export function PageSmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!prefersReducedMotion) {
      root.style.scrollBehavior = 'smooth';
    }

    return () => {
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
