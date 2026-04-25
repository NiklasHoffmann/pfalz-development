import type { NextRequest } from 'next/server';
import AdminAuditLog from '@/models/AdminAuditLog';
import connectToDatabase from '@/lib/mongodb';
import { logger } from '@/lib/logger';
import type { IntakeStaffRole } from '@/types/intake';

interface AuditStaffUserShape {
  id?: unknown;
  _id?: unknown;
  email?: string;
  role?: IntakeStaffRole;
}

interface AdminAuditAuthState {
  via: 'session' | 'api-key';
  staffUser?: AuditStaffUserShape | null;
}

interface WriteAdminAuditLogInput {
  request: NextRequest;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  authState?: AdminAuditAuthState | null;
  metadata?: Record<string, unknown>;
  required?: boolean;
}

const redactedKeys = new Set([
  'password',
  'passwordHash',
  'token',
  'tokenHash',
  'tokenPreview',
  'rawToken',
  'accessUrl',
  'qrValue',
  'json',
]);

function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return candidate;
  }

  return request.headers.get('x-real-ip')?.trim() || undefined;
}

function sanitizeAuditValue(value: unknown, depth: number = 0): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 497)}...` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (depth >= 4) {
      return `[array:${value.length}]`;
    }

    return value
      .slice(0, 25)
      .map((entry) => sanitizeAuditValue(entry, depth + 1));
  }

  if (typeof value === 'object') {
    if (depth >= 4) {
      return '[truncated-object]';
    }

    const result: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(
      value as Record<string, unknown>
    )) {
      result[key] = redactedKeys.has(key)
        ? '[redacted]'
        : sanitizeAuditValue(entry, depth + 1);
    }

    return result;
  }

  return String(value);
}

export function getAdminActorUserId(authState?: AdminAuditAuthState | null) {
  if (authState?.via !== 'session' || !authState.staffUser) {
    return undefined;
  }

  return String(authState.staffUser.id ?? authState.staffUser._id ?? '');
}

export async function writeAdminAuditLog({
  request,
  action,
  resourceType,
  resourceId,
  authState,
  metadata,
  required = false,
}: WriteAdminAuditLogInput) {
  try {
    await connectToDatabase();

    const actorUserId = getAdminActorUserId(authState) || undefined;
    const actorType =
      authState?.via === 'api-key'
        ? 'api-key'
        : actorUserId
          ? 'staff-user'
          : 'system';

    await AdminAuditLog.create({
      action,
      resourceType,
      resourceId: resourceId || undefined,
      actorType,
      actorUserId,
      actorEmail:
        authState?.via === 'session'
          ? authState.staffUser?.email?.toLowerCase()
          : undefined,
      actorRole:
        authState?.via === 'session' ? authState.staffUser?.role : undefined,
      requestPath: request.nextUrl.pathname,
      method: request.method,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      metadata:
        metadata && Object.keys(metadata).length > 0
          ? (sanitizeAuditValue(metadata) as Record<string, unknown>)
          : undefined,
    });
  } catch (error) {
    const message = `Admin audit log write failed (action=${action}, resourceType=${resourceType}): ${error instanceof Error ? error.message : String(error)}`;

    if (required) {
      logger.error(message);
      throw error instanceof Error ? error : new Error(message);
    }

    logger.warn(message);
  }
}
