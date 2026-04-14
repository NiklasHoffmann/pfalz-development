import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';

interface HeaderReader {
  get(name: string): string | null | undefined;
}

function normalizeIp(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('::ffff:')) {
    return trimmedValue.slice(7);
  }

  return trimmedValue;
}

export function getClientIpFromHeaders(headerReader: HeaderReader) {
  const forwarded = headerReader.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return normalizeIp(candidate);
  }

  const realIp = headerReader.get('x-real-ip')?.trim();

  if (realIp) {
    return normalizeIp(realIp);
  }

  return 'anonymous';
}

export function getClientIp(request: NextRequest) {
  return getClientIpFromHeaders(request.headers);
}

export function getConfiguredAdminAllowedIps() {
  return (env.ADMIN_ALLOWED_IPS || '')
    .split(',')
    .map((value) => normalizeIp(value))
    .filter(Boolean);
}

export function isAllowedAdminIp(ip: string) {
  const allowedIps = getConfiguredAdminAllowedIps();

  if (!allowedIps.length) {
    return true;
  }

  return allowedIps.includes(normalizeIp(ip));
}

export async function isCurrentRequestFromAllowedAdminIp() {
  const headerStore = await headers();
  return isAllowedAdminIp(getClientIpFromHeaders(headerStore));
}
