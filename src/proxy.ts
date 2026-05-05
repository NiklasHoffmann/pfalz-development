import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getConfiguredAdminHost, getRequestHost } from './lib/admin-host';
import { routing } from './routing';

const proxy = createMiddleware(routing);

function buildNotFoundRewrite(request: NextRequest, pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const locale = routing.locales.includes(
    firstSegment as (typeof routing.locales)[number]
  )
    ? firstSegment
    : routing.defaultLocale;

  return NextResponse.rewrite(new URL(`/${locale}/404`, request.url));
}

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isAllowedAdminPagePath(pathname: string) {
  const adminBases = [
    '/admin',
    ...routing.locales.map((locale) => `/${locale}/admin`),
  ];

  return adminBases.some((base) => matchesPathPrefix(pathname, base));
}

function isAllowedAdminApiPath(pathname: string) {
  return (
    pathname === '/api/health' || matchesPathPrefix(pathname, '/api/admin')
  );
}

export default function middleware(request: NextRequest) {
  const configuredAdminHost = getConfiguredAdminHost();
  const requestHost = getRequestHost(request.headers);
  const isAdminHost = Boolean(
    configuredAdminHost && requestHost === configuredAdminHost
  );
  const { pathname } = request.nextUrl;

  if (pathname.endsWith('.map')) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith('/api/')) {
    if (
      configuredAdminHost &&
      !isAdminHost &&
      matchesPathPrefix(pathname, '/api/admin')
    ) {
      return new NextResponse(null, { status: 404 });
    }

    if (isAdminHost && !isAllowedAdminApiPath(pathname)) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.next();
  }

  if (configuredAdminHost && !isAdminHost && isAllowedAdminPagePath(pathname)) {
    return buildNotFoundRewrite(request, pathname);
  }

  if (isAdminHost && !isAllowedAdminPagePath(pathname)) {
    return buildNotFoundRewrite(request, pathname);
  }

  return proxy(request);
}

export const config = {
  matcher: [
    // Match app and API pathnames except Next internals and static files.
    '/((?!_next|_vercel|.*\\..*).*)',
    // Block direct access to source maps, including under /_next/static.
    '/(.*)\\.map',
  ],
};
