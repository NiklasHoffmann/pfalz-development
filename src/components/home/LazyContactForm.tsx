'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const ContactForm = dynamic(
  () =>
    import('@/components/ui/ContactForm').then((module) => module.ContactForm),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[520px] animate-pulse rounded-[1.75rem] bg-white/70 p-6 dark:bg-stone-800/60" />
    ),
  }
);

export function LazyContactForm() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad || !hostRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '220px 0px' }
    );

    observer.observe(hostRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return <div ref={hostRef}>{shouldLoad ? <ContactForm /> : null}</div>;
}
