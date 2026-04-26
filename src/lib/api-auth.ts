import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { errorResponse } from './api-response';
import { getStaffUserFromRequest } from './auth/admin-session';
import { env } from './env';
import { logger } from './logger';
import { rateLimitPersistent } from './rate-limit';
import { getClientIp, isAllowedAdminIp } from './admin-network';
import type { IntakeStaffRole } from '@/types/intake';

const ADMIN_HEADER = 'x-admin-key';

function safeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function hasValidAdminApiKey(request: NextRequest): boolean {
  const configuredKey = env.ADMIN_API_KEY?.trim();
  const providedKey = request.headers.get(ADMIN_HEADER)?.trim();

  if (!configuredKey || !providedKey) {
    return false;
  }

  return safeEquals(providedKey, configuredKey);
}

export function requireAdminApiKey(request: NextRequest) {
  if (!isAllowedAdminIp(getClientIp(request))) {
    return errorResponse('Forbidden', 403);
  }

  if (!hasValidAdminApiKey(request)) {
    return errorResponse('Not found', 404);
  }

  return null;
}

export async function requireIntakeAdminAccess(
  request: NextRequest,
  allowedRoles?: IntakeStaffRole[]
) {
  if (!isAllowedAdminIp(getClientIp(request))) {
    return errorResponse('Forbidden', 403);
  }

  if (hasValidAdminApiKey(request)) {
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
  const forwardedHost = request.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim();

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
    const rateLimitResult = await rateLimitPersistent(
      `admin:${scope}:${getClientIp(request)}`
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
  rateLimitScope: string
) {
  const rateLimitError = await requireAdminRouteRateLimit(
    request,
    rateLimitScope
  );

  if (rateLimitError) {
    return rateLimitError;
  }

  const authState = await requireIntakeAdminAccess(request, allowedRoles);

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
