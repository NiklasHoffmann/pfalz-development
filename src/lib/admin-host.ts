import { env } from '@/lib/env';

interface HeaderReader {
  get(name: string): string | null | undefined;
}

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
  return normalizeHost(
    headerReader.get('x-forwarded-host') || headerReader.get('host')
  );
}

export function isAllowedAdminHost(host: string | null) {
  const configuredAdminHost = getConfiguredAdminHost();

  if (!configuredAdminHost) {
    return true;
  }

  return host === configuredAdminHost;
}
