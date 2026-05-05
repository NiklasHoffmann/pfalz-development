import { headers } from 'next/headers';
import { NONCE_HEADER_NAME } from '@/lib/csp';

interface JsonLdScriptProps {
  data: unknown;
}

export async function JsonLdScript({ data }: JsonLdScriptProps) {
  const nonce = (await headers()).get(NONCE_HEADER_NAME) ?? undefined;

  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
