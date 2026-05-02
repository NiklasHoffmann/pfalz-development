import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { errorResponse } from './api-response';
import { getStaffUserFromRequest } from './auth/admin-session';
import { env } from './env';
import { logger } from './logger';
import { rateLimitPersistent } from './rate-limit';
import { getClientIp, isAllowedAdminIp } from './admin-network';
import { getRequestHost, isAllowedAdminHost } from './admin-host';
import type { IntakeStaffRole } from '@/types/intake';

const ADMIN_HEADER = 'x-admin-key';
const ADMIN_API_KEY_ALLOWED_PATHS = [
  '/api/admin/staff/bootstrap',
  '/api/intake/uploads/',
  '/api/users',
  '/api/users/',
] as const;

interface AdminAccessOptions {
  allowApiKey?: boolean;
}

const ADMIN_RATE_LIMIT_OVERRIDES: Record<
  string,
  { limit: number; windowMs: number }
> = {
  login: { limit: 5, windowMs: 5 * 60 * 1000 },
  'forgot-password': { limit: 3, windowMs: 15 * 60 * 1000 },
  'reset-password': { limit: 5, windowMs: 15 * 60 * 1000 },
  'staff-bootstrap': { limit: 3, windowMs: 60 * 60 * 1000 },
};

function isAllowedAdminApiKeyPath(pathname: string) {
  return ADMIN_API_KEY_ALLOWED_PATHS.some((allowedPath) =>
    allowedPath.endsWith('/')
      ? pathname.startsWith(allowedPath)
      : pathname === allowedPath
  );
}

function safeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function hasValidAdminApiKey(request: NextRequest): boolean {
  if (!isAllowedAdminApiKeyPath(request.nextUrl.pathname)) {
    return false;
  }

  const configuredKey = env.ADMIN_API_KEY?.trim();
  const providedKey = request.headers.get(ADMIN_HEADER)?.trim();

  if (!configuredKey || !providedKey) {
    return false;
  }

  return safeEquals(providedKey, configuredKey);
}

export function requireAdminApiKey(request: NextRequest) {
  if (!isAllowedAdminHost(getRequestHost(request.headers))) {
    return errorResponse('Not found', 404);
  }

  if (!isAllowedAdminIp(getClientIp(request))) {
    return errorResponse('Forbidden', 403);
  }

  if (!hasValidAdminApiKey(request)) {
    return errorResponse('Not found', 404);
  }

  return null;
}

export function requireAdminRequestAccess(request: NextRequest) {
  if (!isAllowedAdminHost(getRequestHost(request.headers))) {
    return errorResponse('Not found', 404);
  }

  if (isAllowedAdminIp(getClientIp(request))) {
    return null;
  }

  return errorResponse('Forbidden', 403);
}

export async function requireIntakeAdminAccess(
  request: NextRequest,
  allowedRoles?: IntakeStaffRole[],
  options?: AdminAccessOptions
) {
  if (!isAllowedAdminHost(getRequestHost(request.headers))) {
    return errorResponse('Not found', 404);
  }

  if (!isAllowedAdminIp(getClientIp(request))) {
    return errorResponse('Forbidden', 403);
  }

  if (options?.allowApiKey && hasValidAdminApiKey(request)) {
    return { via: 'api-key' as const, staffUser: null };
  }

  const staffUser = await getStaffUserFromRequest(request, allowedRoles);

  if (!staffUser) {
    return errorResponse('Unauthorized', 401);
  }

  return {
    via: 'session' as const,
    staffUser,
  };
}

function getRequestOrigin(request: NextRequest) {
  const originHeader = request.headers.get('origin')?.trim();

  if (originHeader) {
    try {
      return new URL(originHeader).origin;
    } catch {
      return null;
    }
  }

  const refererHeader = request.headers.get('referer')?.trim();

  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
}

function getExpectedOrigin(request: NextRequest) {
  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();
  const forwardedHost = getRequestHost(request.headers);

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get('host')?.trim();

  if (host) {
    return `${request.nextUrl.protocol.replace(/:$/, '')}://${host}`;
  }

  return request.nextUrl.origin;
}

export function requireTrustedAdminOrigin(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);

  if (!requestOrigin) {
    return errorResponse('Forbidden', 403);
  }

  if (requestOrigin !== getExpectedOrigin(request)) {
    return errorResponse('Forbidden', 403);
  }

  return null;
}

export async function requireAdminRouteRateLimit(
  request: NextRequest,
  scope: string
) {
  try {
    const override = ADMIN_RATE_LIMIT_OVERRIDES[scope];
    const rateLimitResult = await rateLimitPersistent(
      `admin:${scope}:${getClientIp(request)}`,
      override
    );

    if (!rateLimitResult.success) {
      return errorResponse(
        'Zu viele Anfragen. Bitte später erneut versuchen.',
        429
      );
    }

    return null;
  } catch (error) {
    logger.error(
      `Admin rate limit unavailable for scope=${scope}: ${error instanceof Error ? error.message : String(error)}`
    );
    return errorResponse(
      'Admin-Schutz ist temporär nicht verfügbar. Bitte später erneut versuchen.',
      503
    );
  }
}

export async function requireIntakeAdminMutationAccess(
  request: NextRequest,
  allowedRoles: IntakeStaffRole[],
  rateLimitScope: string,
  options?: AdminAccessOptions
) {
  const rateLimitError = await requireAdminRouteRateLimit(
    request,
    rateLimitScope
  );

  if (rateLimitError) {
    return rateLimitError;
  }

  const authState = await requireIntakeAdminAccess(
    request,
    allowedRoles,
    options
  );

  if ('status' in authState) {
    return authState;
  }

  if (authState.via === 'session') {
    const originError = requireTrustedAdminOrigin(request);

    if (originError) {
      return originError;
    }
  }

  return authState;
}
