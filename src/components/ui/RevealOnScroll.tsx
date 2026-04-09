'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type RevealTag = 'div' | 'section' | 'article' | 'p' | 'span' | 'li';

const ROUTE_REVEAL_STORAGE_PREFIX = 'pfalz-development:revealed-route:';

interface RevealOnScrollProps extends HTMLAttributes<HTMLElement> {
  as?: RevealTag;
  children: ReactNode;
  delayMs?: number;
  once?: boolean;
  revealOncePerPath?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function RevealOnScroll({
  as = 'div',
  children,
  className,
  style,
  delayMs = 0,
  once = true,
  revealOncePerPath = true,
  threshold = 0.16,
  rootMargin = '0px 0px -4% 0px',
  ...rest
}: RevealOnScrollProps) {
  const Element = as;
  const elementRef = useRef<HTMLElement | null>(null);
  const mergedClassName = ['reveal-on-scroll', className ?? '']
    .join(' ')
    .trim();

  const mergedStyle: CSSProperties = {
    ...style,
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties;

  useEffect(() => {
    const node = elementRef.current;
    if (!node) {
      return;
    }

    const shouldPersistByPath = once && revealOncePerPath;
    const routeRevealStorageKey = `${ROUTE_REVEAL_STORAGE_PREFIX}${window.location.pathname}`;

    const readRouteRevealState = () => {
      if (!shouldPersistByPath) {
        return false;
      }

      try {
        return window.sessionStorage.getItem(routeRevealStorageKey) === '1';
      } catch {
        return false;
      }
    };

    const writeRouteRevealState = () => {
      if (!shouldPersistByPath) {
        return;
      }

      try {
        window.sessionStorage.setItem(routeRevealStorageKey, '1');
      } catch {
        // Ignore storage access failures and fall back to in-memory reveal only.
      }
    };

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || readRouteRevealState()) {
      node.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          writeRouteRevealState();

          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          node.classList.remove('is-visible');
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, revealOncePerPath, threshold, rootMargin]);

  return (
    <Element
      ref={elementRef as never}
      className={mergedClassName}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Element>
  );
}
