import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getConfiguredAdminHost, getRequestHost } from './lib/admin-host';
import { buildContentSecurityPolicy, NONCE_HEADER_NAME } from './lib/csp';
import { routing } from './routing';

const proxy = createMiddleware(routing);

function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = '';

  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }

  return btoa(binary);
}

function applyRequestHeaderOverrides(
  response: NextResponse,
  requestHeaders: Headers
) {
  const existingOverrideHeaders = response.headers
    .get('x-middleware-override-headers')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (existingOverrideHeaders?.length) {
    for (const key of existingOverrideHeaders) {
      const existingValue = response.headers.get(`x-middleware-request-${key}`);

      if (existingValue !== null) {
        requestHeaders.set(key, existingValue);
      }
    }
  }

  const overrideKeys: string[] = [];

  for (const [key, value] of requestHeaders) {
    response.headers.set(`x-middleware-request-${key}`, value);
    overrideKeys.push(key);
  }

  response.headers.set('x-middleware-override-headers', overrideKeys.join(','));
}

function applyContentSecurityPolicy(
  request: NextRequest,
  response: NextResponse
) {
  const requestHeaders = new Headers(request.headers);
  const nonce = createNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce, {
    enforceHttpsUpgrade: request.nextUrl.protocol === 'https:',
    isDevelopment: process.env.NODE_ENV !== 'production',
  });

  requestHeaders.set(NONCE_HEADER_NAME, nonce);
  requestHeaders.set('content-security-policy', contentSecurityPolicy);
  applyRequestHeaderOverrides(response, requestHeaders);
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
}

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function hasHiddenPathSegment(pathname: string) {
  return pathname
    .split('/')
    .filter(Boolean)
    .some((segment) => segment.startsWith('.'));
}

function isStaticAssetPath(pathname: string) {
  return /(^|\/)[^/.][^/]*\.[^/]+$/.test(pathname);
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

  if (hasHiddenPathSegment(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.endsWith('.map')) {
    return new NextResponse(null, { status: 404 });
  }

  if (isStaticAssetPath(pathname)) {
    return NextResponse.next();
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

    const response = NextResponse.next();
    applyContentSecurityPolicy(request, response);
    return response;
  }

  if (configuredAdminHost && !isAdminHost && isAllowedAdminPagePath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  if (isAdminHost && !isAllowedAdminPagePath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const response = proxy(request);
  applyContentSecurityPolicy(request, response);
  return response;
}

export const config = {
  matcher: [
    // Match app, API, and direct path probes except Next internals.
    '/((?!_next|_vercel).*)',
    // Block direct access to source maps, including under /_next/static.
    '/(.*)\\.map',
  ],
};
