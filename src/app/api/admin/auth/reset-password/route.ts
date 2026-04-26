import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import {
  requireAdminRequestAccess,
  requireAdminRouteRateLimit,
  requireTrustedAdminOrigin,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import { getClientIp } from '@/lib/admin-network';
import { hashPassword } from '@/lib/auth/password';
import { hashPasswordResetToken } from '@/lib/auth/password-reset';
import { logger } from '@/lib/logger';
import connectToDatabase from '@/lib/mongodb';
import AdminPasswordResetToken from '@/models/AdminPasswordResetToken';
import StaffUser from '@/models/StaffUser';
import { resetStaffPasswordSchema } from '@/schemas/intake/staff-auth.schema';

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
    const rateLimitError = await requireAdminRouteRateLimit(
      request,
      'reset-password'
    );

    if (rateLimitError) {
      logger.warn(`Staff reset-password rate limited (ip=${clientIp})`);
      return rateLimitError;
    }

    const body = resetStaffPasswordSchema.parse(await request.json());

    await connectToDatabase();
    const tokenHash = hashPasswordResetToken(body.token);
    const tokenRecord = await AdminPasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).exec();

    if (!tokenRecord) {
      logger.warn(
        `Staff reset-password failed due to invalid token (ip=${clientIp})`
      );
      return errorResponse('Reset-Link ist ungültig oder abgelaufen', 400);
    }

    const staffUser = await StaffUser.findOne({
      _id: tokenRecord.staffUserId,
      email: tokenRecord.email,
      isActive: true,
    }).exec();

    if (!staffUser) {
      tokenRecord.usedAt = new Date();
      await tokenRecord.save();
      return errorResponse('Reset-Link ist ungültig oder abgelaufen', 400);
    }

    staffUser.passwordHash = hashPassword(body.password);
    await staffUser.save();

    await AdminPasswordResetToken.updateMany(
      { staffUserId: staffUser._id, usedAt: null },
      { $set: { usedAt: new Date() } }
    ).exec();

    await writeAdminAuditLog({
      request,
      action: 'admin.auth.password-reset.complete',
      resourceType: 'staff-user',
      resourceId: String(staffUser.id ?? staffUser._id),
      required: true,
      metadata: {
        email: staffUser.email,
      },
    });

    logger.info(
      `Staff password reset completed for user=${staffUser.email} (ip=${clientIp})`
    );

    return successResponse(
      { reset: true },
      'Passwort wurde erfolgreich aktualisiert'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
