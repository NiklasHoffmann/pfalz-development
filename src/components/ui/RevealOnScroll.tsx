'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type RevealTag = 'div' | 'section' | 'article' | 'p' | 'span';

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
  threshold = 0.14,
  rootMargin = '0px 0px -10% 0px',
  ...rest
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
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

  const Element = as;
  const mergedClassName = [
    'reveal-on-scroll',
    isVisible ? 'is-visible' : '',
    className ?? '',
  ]
    .join(' ')
    .trim();

  const mergedStyle: CSSProperties = {
    ...style,
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties;

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
