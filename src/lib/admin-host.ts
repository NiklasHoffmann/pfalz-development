import { timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';

interface HeaderReader {
  get(name: string): string | null | undefined;
}

const ADMIN_PROXY_SECRET_HEADER = 'x-admin-proxy-secret';
const ADMIN_PROXY_FORWARDED_HOST_HEADER = 'x-admin-forwarded-host';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function normalizeHost(value: string | null | undefined) {
  const candidate = value?.split(',')[0]?.trim();

  if (!candidate) {
    return null;
  }

  try {
    return new URL(`http://${candidate}`).hostname.toLowerCase();
  } catch {
    return candidate.toLowerCase().replace(/:\d+$/, '');
  }
}

function safeEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function getTrustedProxyHost(headerReader: HeaderReader) {
  const configuredSecret = env.ADMIN_PROXY_SHARED_SECRET?.trim();
  const providedSecret = headerReader.get(ADMIN_PROXY_SECRET_HEADER)?.trim();

  if (!configuredSecret || !providedSecret) {
    return null;
  }

  if (!safeEquals(providedSecret, configuredSecret)) {
    return null;
  }

  return normalizeHost(headerReader.get(ADMIN_PROXY_FORWARDED_HOST_HEADER));
}

export function getAdminAppUrl() {
  return trimTrailingSlash(
    env.ADMIN_APP_URL?.trim() || env.NEXT_PUBLIC_APP_URL
  );
}

export function buildAdminAppUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAdminAppUrl()}${normalizedPath}`;
}

export function getConfiguredAdminHost() {
  const adminAppUrl = env.ADMIN_APP_URL?.trim();

  if (!adminAppUrl) {
    return null;
  }

  return new URL(adminAppUrl).hostname.toLowerCase();
}

export function getRequestHost(headerReader: HeaderReader) {
  return (
    getTrustedProxyHost(headerReader) ||
    normalizeHost(
      headerReader.get('x-forwarded-host') || headerReader.get('host')
    )
  );
}

export function isAllowedAdminHost(host: string | null) {
  const configuredAdminHost = getConfiguredAdminHost();

  if (!configuredAdminHost) {
    return true;
  }

  return host === configuredAdminHost;
}
