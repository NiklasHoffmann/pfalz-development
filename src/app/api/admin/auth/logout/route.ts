import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireAdminRequestAccess,
  requireTrustedAdminOrigin,
} from '@/lib/api-auth';
import { getStaffUserFromRequest } from '@/lib/auth/admin-session';
import { env } from '@/lib/env';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/intake/constants';

export async function POST(request: NextRequest) {
  const accessError = requireAdminRequestAccess(request);

  if (accessError) {
    return accessError;
  }

  const originError = requireTrustedAdminOrigin(request);

  if (originError) {
    return originError;
  }

  const staffUser = await getStaffUserFromRequest(request);

  if (staffUser) {
    await writeAdminAuditLog({
      request,
      authState: { via: 'session', staffUser },
      action: 'admin.auth.logout',
      resourceType: 'staff-session',
      resourceId: String(staffUser.id ?? staffUser._id),
      required: true,
      metadata: {
        email: staffUser.email,
        role: staffUser.role,
      },
    });
  }

  const response = successResponse({ loggedOut: true }, 'Logout successful');

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    priority: 'high',
    path: '/',
    maxAge: 0,
  });

  return response;
}
