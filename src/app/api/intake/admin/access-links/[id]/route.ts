import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import { requireIntakeAdminMutationAccess } from '@/lib/api-auth';
import { siteConfig } from '@/config/site';
import { buildProjectTokenPath } from '@/lib/intake/path';
import {
  generateIntakeToken,
  getIntakeTokenPreview,
  hashIntakeToken,
} from '@/lib/intake/token';
import connectToDatabase from '@/lib/mongodb';
import IntakeAccessLink from '@/models/IntakeAccessLink';
import { updateIntakeAccessLinkAdminSchema } from '@/schemas/intake/admin.schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'intake-access-link-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const body = updateIntakeAccessLinkAdminSchema.parse(await request.json());
    const accessLink = await IntakeAccessLink.findById(id).exec();

    if (!accessLink) {
      return errorResponse('Access link not found', 404);
    }

    let accessUrl: string | undefined;
    let qrValue: string | undefined;

    if (body.isActive !== undefined) {
      accessLink.isActive = body.isActive;
    }

    if (body.regenerateToken) {
      const rawToken = generateIntakeToken();
      const locale = accessLink.locale || 'de';

      accessLink.tokenHash = hashIntakeToken(rawToken);
      accessLink.tokenPreview = getIntakeTokenPreview(rawToken);

      const accessPath = buildProjectTokenPath(locale, rawToken);
      accessUrl = `${siteConfig.url}${accessPath}`;
      qrValue = accessUrl;
    }

    await accessLink.save();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.access-link.update',
      resourceType: 'access-link',
      resourceId: String(accessLink.id ?? accessLink._id),
      metadata: {
        isActive: body.isActive,
        regenerateToken: Boolean(body.regenerateToken),
        locale: accessLink.locale,
        projectId: accessLink.projectId,
      },
    });

    return successResponse(
      {
        accessLink: accessLink.toJSON(),
        accessUrl,
        qrValue,
      },
      'Access link updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
