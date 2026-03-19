'use client';

import { useEffect } from 'react';

const HEADER_ID = 'home-header';
const OFFSET_VAR = '--home-scroll-offset';
const EXTRA_SPACING_PX = 0;

export function HomeScrollOffsetSync() {
  useEffect(() => {
    const root = document.documentElement;

    const updateOffset = () => {
      const header = document.getElementById(HEADER_ID);
      if (!header) {
        return 0;
      }

      const headerHeight = Math.round(header.getBoundingClientRect().height);
      const offset = Math.max(0, headerHeight + EXTRA_SPACING_PX);
      root.style.setProperty(OFFSET_VAR, `${offset}px`);
      root.style.scrollPaddingTop = `${offset}px`;

      return offset;
    };

    const getTargetElementFromHash = (hash: string) => {
      if (!hash || hash === '#') {
        return null;
      }

      const id = decodeURIComponent(hash.slice(1));
      if (!id) {
        return null;
      }

      return document.getElementById(id);
    };

    const scrollToElement = (element: HTMLElement, behavior: ScrollBehavior) => {
      const offset = updateOffset();
      const top = Math.max(
        0,
        window.scrollY + element.getBoundingClientRect().top - offset
      );

      window.scrollTo({
        top,
        behavior,
      });
    };

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }

      const element = getTargetElementFromHash(href);
      if (!element) {
        return;
      }

      event.preventDefault();
      scrollToElement(element, 'smooth');

      if (window.location.hash !== href) {
        window.history.pushState(null, '', href);
      }
    };

    const handleHashChange = () => {
      const element = getTargetElementFromHash(window.location.hash);
      if (!element) {
        return;
      }

      scrollToElement(element, 'auto');
    };

    updateOffset();

    if (window.location.hash) {
      requestAnimationFrame(() => {
        handleHashChange();
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      updateOffset();
    });

    const header = document.getElementById(HEADER_ID);
    if (header) {
      resizeObserver.observe(header);
    }

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('resize', updateOffset);
    window.addEventListener('orientationchange', updateOffset);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('resize', updateOffset);
      window.removeEventListener('orientationchange', updateOffset);
      root.style.removeProperty(OFFSET_VAR);
      root.style.removeProperty('scroll-padding-top');
    };
  }, []);

  return null;
}
