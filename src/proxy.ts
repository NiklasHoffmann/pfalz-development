import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getConfiguredAdminHost, getRequestHost } from './lib/admin-host';
import { routing } from './routing';

const proxy = createMiddleware(routing);

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

  if (pathname.startsWith('/api/')) {
    if (isAdminHost && !isAllowedAdminApiPath(pathname)) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.next();
  }

  if (isAdminHost && !isAllowedAdminPagePath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return proxy(request);
}

export const config = {
  // Match app and API pathnames except Next internals and static files.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
