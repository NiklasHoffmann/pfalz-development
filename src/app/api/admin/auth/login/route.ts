import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import {
  requireAdminRequestAccess,
  requireTrustedAdminOrigin,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import { encodeAdminSession } from '@/lib/auth/admin-session';
import { verifyPassword } from '@/lib/auth/password';
import { env } from '@/lib/env';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { logger } from '@/lib/logger';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';
import { staffLoginSchema } from '@/schemas/intake/staff-auth.schema';
import { requireAdminRouteRateLimit } from '@/lib/api-auth';
import { getClientIp } from '@/lib/admin-network';

export async function POST(request: NextRequest) {
  try {
    const accessError = requireAdminRequestAccess(request);

    if (accessError) {
      return accessError;
    }

    const originError = requireTrustedAdminOrigin(request);

    if (originError) {
      return originError;
    }

    const clientIp = getClientIp(request);
    const rateLimitError = await requireAdminRouteRateLimit(request, 'login');

    if (rateLimitError) {
      await writeAdminAuditLog({
        request,
        action: 'admin.auth.login.rate-limited',
        resourceType: 'staff-session',
        metadata: {
          ip: clientIp,
        },
      });
      logger.warn(`Staff login rate limited (ip=${clientIp})`);
      return rateLimitError;
    }

    const body = staffLoginSchema.parse(await request.json());

    await connectToDatabase();
    const staffUser = await StaffUser.findOne({
      email: body.email.toLowerCase(),
      isActive: true,
    }).exec();

    if (!staffUser || !verifyPassword(body.password, staffUser.passwordHash)) {
      await writeAdminAuditLog({
        request,
        action: 'admin.auth.login.failed',
        resourceType: 'staff-session',
        metadata: {
          email: body.email.toLowerCase(),
        },
      });
      logger.warn(
        `Staff login failed (email=${body.email.toLowerCase()}, ip=${clientIp})`
      );
      return errorResponse('Ungültige Zugangsdaten', 401);
    }

    staffUser.lastLoginAt = new Date();
    await staffUser.save();

    const response = successResponse(
      {
        staffUser,
      },
      'Login successful'
    );

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE_NAME,
      value: encodeAdminSession({
        staffUserId: String(staffUser.id ?? staffUser._id),
        role: staffUser.role,
        issuedAt: Date.now(),
      }),
      httpOnly: true,
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
      priority: 'high',
      path: '/',
      maxAge: env.ADMIN_SESSION_DURATION_HOURS * 60 * 60,
    });

    await writeAdminAuditLog({
      request,
      authState: { via: 'session', staffUser },
      action: 'admin.auth.login.succeeded',
      resourceType: 'staff-session',
      resourceId: String(staffUser.id ?? staffUser._id),
      metadata: {
        email: staffUser.email,
        role: staffUser.role,
      },
    });

    logger.info(
      `Staff login succeeded (user=${staffUser.email}, ip=${clientIp})`
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
