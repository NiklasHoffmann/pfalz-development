import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

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
  once: _once = true,
  threshold: _threshold = 0.08,
  rootMargin: _rootMargin = '0px 0px 12% 0px',
  ...rest
}: RevealOnScrollProps) {
  const Element = as;
  const mergedClassName = ['reveal-on-scroll', className ?? '']
    .join(' ')
    .trim();

  const mergedStyle: CSSProperties = {
    ...style,
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties;

  return (
    <Element className={mergedClassName} style={mergedStyle} {...rest}>
      {children}
    </Element>
  );
}
