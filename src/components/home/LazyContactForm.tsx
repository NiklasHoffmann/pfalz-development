'use client';

import dynamic from 'next/dynamic';

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
  return <ContactForm />;
}
