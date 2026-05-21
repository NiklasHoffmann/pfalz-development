import { NextRequest } from 'next/server';
import { env } from '@/lib/env';

export function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')?.trim();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.trim();

  if (forwardedHost) {
    const protocol = forwardedProto || 'https';
    return `${protocol}://${forwardedHost}`;
  }

  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  return request.nextUrl.origin;
}
