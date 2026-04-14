import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireAdminRouteRateLimit,
  requireIntakeAdminAccess,
} from '@/lib/api-auth';
import { siteConfig } from '@/config/site';
import { buildProjectSharePath } from '@/lib/intake/path';
import { createAccessLinkShareToken } from '@/lib/intake/share-link';
import connectToDatabase from '@/lib/mongodb';
import IntakeAccessLink from '@/models/IntakeAccessLink';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const rateLimitError = requireAdminRouteRateLimit(
      request,
      'intake-access-link-share'
    );

    if (rateLimitError) {
      return rateLimitError;
    }

    const authState = await requireIntakeAdminAccess(request, ['admin']);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const accessLink = await IntakeAccessLink.findById(id).exec();

    if (!accessLink) {
      return errorResponse('Access link not found', 404);
    }

    if (!accessLink.isActive) {
      return errorResponse('Access link is inactive and cannot be shared', 409);
    }

    if (accessLink.expiresAt && accessLink.expiresAt.getTime() <= Date.now()) {
      return errorResponse('Access link is expired and cannot be shared', 409);
    }

    const shareToken = createAccessLinkShareToken(
      String(accessLink.id ?? accessLink._id)
    );
    const accessPath = buildProjectSharePath(
      accessLink.locale || 'de',
      shareToken
    );
    const accessUrl = `${siteConfig.url}${accessPath}`;

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.access-link.share.read',
      resourceType: 'access-link',
      resourceId: String(accessLink.id ?? accessLink._id),
      metadata: {
        locale: accessLink.locale || 'de',
        projectId: accessLink.projectId,
        tokenPreview: accessLink.tokenPreview,
      },
    });

    return successResponse(
      {
        accessUrl,
        qrValue: accessUrl,
        tokenPreview: accessLink.tokenPreview,
      },
      'Access link share URL retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
