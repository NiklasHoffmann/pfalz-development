import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { getRequestHost, isAllowedAdminHost } from '@/lib/admin-host';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { getClientIpFromHeaders, isAllowedAdminIp } from '@/lib/admin-network';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';
import type {
  AdminSessionPayload,
  IStaffUser,
  IntakeStaffRole,
} from '@/types/intake';

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

function getSessionSecret() {
  const configuredSecret = env.ADMIN_SESSION_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  throw new Error(
    'ADMIN_SESSION_SECRET must be configured for admin authentication'
  );
}

function sign(payload: string) {
  return createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

export function encodeAdminSession(payload: AdminSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  );
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function decodeAdminSession(
  value: string | undefined
): AdminSessionPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AdminSessionPayload;

    if (!Number.isFinite(payload.issuedAt)) {
      return null;
    }

    const maxSessionAgeMs = env.ADMIN_SESSION_DURATION_HOURS * 60 * 60 * 1000;

    if (payload.issuedAt + maxSessionAgeMs <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

type StaffUserDocument = IStaffUser & { _id?: unknown; id?: unknown };

function matchesAllowedRole(
  role: IntakeStaffRole,
  allowedRoles?: IntakeStaffRole[]
) {
  if (!allowedRoles?.length) {
    return true;
  }

  return allowedRoles.includes(role);
}

export async function getStaffUserBySessionPayload(
  payload: AdminSessionPayload | null,
  allowedRoles?: IntakeStaffRole[]
): Promise<StaffUserDocument | null> {
  if (!payload || !matchesAllowedRole(payload.role, allowedRoles)) {
    return null;
  }

  await connectToDatabase();
  const staffUser = await StaffUser.findById(payload.staffUserId).exec();

  if (!staffUser || !staffUser.isActive || staffUser.role !== payload.role) {
    return null;
  }

  return staffUser;
}

export async function getStaffUserFromRequest(
  request: NextRequest,
  allowedRoles?: IntakeStaffRole[]
) {
  return getStaffUserBySessionPayload(
    decodeAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value),
    allowedRoles
  );
}

function getCookieValue(cookieStore: CookieReader) {
  return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
}

export async function getStaffUserFromCookieStore(
  cookieStore: CookieReader,
  allowedRoles?: IntakeStaffRole[]
) {
  return getStaffUserBySessionPayload(
    decodeAdminSession(getCookieValue(cookieStore)),
    allowedRoles
  );
}

export async function requireAdminPageEntryAccess() {
  const headerStore = await headers();

  if (
    !isAllowedAdminHost(getRequestHost(headerStore)) ||
    !isAllowedAdminIp(getClientIpFromHeaders(headerStore))
  ) {
    notFound();
  }
}

export async function requireStaffPageAccess(
  locale: string,
  allowedRoles?: IntakeStaffRole[]
) {
  const headerStore = await headers();

  if (
    !isAllowedAdminHost(getRequestHost(headerStore)) ||
    !isAllowedAdminIp(getClientIpFromHeaders(headerStore))
  ) {
    notFound();
  }

  const cookieStore = await cookies();
  const staffUser = await getStaffUserFromCookieStore(
    cookieStore,
    allowedRoles
  );

  if (!staffUser) {
    const loginPath =
      locale === 'de' ? '/admin/login' : `/${locale}/admin/login`;
    redirect(loginPath);
  }

  return staffUser;
}
