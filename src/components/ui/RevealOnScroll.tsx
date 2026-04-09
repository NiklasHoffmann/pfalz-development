'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type RevealTag = 'div' | 'section' | 'article' | 'p' | 'span' | 'li';

interface RevealOnScrollProps extends HTMLAttributes<HTMLElement> {
  as?: RevealTag;
  children: ReactNode;
  delayMs?: number;
  once?: boolean;
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

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
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
  }, [once, threshold, rootMargin]);

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
