import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import {
  requireAdminRequestAccess,
  requireAdminRouteRateLimit,
  requireTrustedAdminOrigin,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import { getClientIp } from '@/lib/admin-network';
import { buildAdminAppUrl } from '@/lib/admin-host';
import {
  generatePasswordResetToken,
  getPasswordResetExpiryDate,
} from '@/lib/auth/password-reset';
import { sendAdminPasswordResetMail } from '@/lib/email';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import connectToDatabase from '@/lib/mongodb';
import AdminPasswordResetToken from '@/models/AdminPasswordResetToken';
import StaffUser from '@/models/StaffUser';
import { requestStaffPasswordResetSchema } from '@/schemas/intake/staff-auth.schema';

const GENERIC_MESSAGE =
  'Wenn ein passender Admin-Zugang existiert, wurde ein Reset-Link per E-Mail versendet.';

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
      'forgot-password'
    );

    if (rateLimitError) {
      logger.warn(`Staff forgot-password rate limited (ip=${clientIp})`);
      return rateLimitError;
    }

    const body = requestStaffPasswordResetSchema.parse(await request.json());

    await connectToDatabase();
    const staffUser = await StaffUser.findOne({
      email: body.email.toLowerCase(),
      isActive: true,
    }).exec();

    if (!staffUser) {
      logger.info(
        `Staff forgot-password requested for unknown email=${body.email.toLowerCase()} (ip=${clientIp})`
      );
      return successResponse({ requested: true }, GENERIC_MESSAGE);
    }

    await AdminPasswordResetToken.updateMany(
      { staffUserId: staffUser._id, usedAt: null },
      { $set: { usedAt: new Date() } }
    ).exec();

    const { rawToken, tokenHash } = generatePasswordResetToken();
    const localePrefix = body.locale === 'de' ? '' : `/${body.locale}`;
    const resetUrl = buildAdminAppUrl(
      `${localePrefix}/admin/reset-password?token=${encodeURIComponent(rawToken)}`
    );

    await AdminPasswordResetToken.create({
      staffUserId: staffUser._id,
      email: staffUser.email,
      tokenHash,
      expiresAt: getPasswordResetExpiryDate(),
    });

    let deliveryMode: 'sent' | 'not-configured' | 'failed' = 'sent';

    try {
      const mailResult = await sendAdminPasswordResetMail({
        toEmail: staffUser.email,
        staffName: staffUser.name,
        resetUrl,
      });

      if (!mailResult.sent) {
        deliveryMode = 'not-configured';
        logger.warn(
          `Staff forgot-password mail skipped for ${staffUser.email} because SMTP is not configured`
        );
      }
    } catch (error) {
      deliveryMode = 'failed';
      logger.error(
        `Staff forgot-password mail failed for ${staffUser.email}: ${String(error)}`
      );
    }

    await writeAdminAuditLog({
      request,
      action: 'admin.auth.password-reset.request',
      resourceType: 'staff-user',
      resourceId: String(staffUser.id ?? staffUser._id),
      required: true,
      metadata: {
        email: staffUser.email,
        deliveryMode,
      },
    });

    logger.info(
      `Staff forgot-password requested for user=${staffUser.email} (ip=${clientIp})`
    );

    return successResponse({ requested: true }, GENERIC_MESSAGE);
  } catch (error) {
    return handleApiError(error);
  }
}
