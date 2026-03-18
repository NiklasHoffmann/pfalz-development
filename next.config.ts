import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const useStandaloneOutput = process.env.NEXT_OUTPUT_STANDALONE === '1';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    qualities: [40, 50, 60, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Keep local builds compatible with `next start`; Docker can opt in via NEXT_OUTPUT_STANDALONE=1.
  output: useStandaloneOutput ? 'standalone' : undefined,
};

export default withNextIntl(nextConfig);
