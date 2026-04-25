import { NextRequest } from 'next/server';
import { errorResponse, handleApiError } from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireAdminRouteRateLimit,
  requireIntakeAdminAccess,
} from '@/lib/api-auth';
import {
  buildAdminSubmissionPrintExport,
  getAdminSubmissionDetail,
} from '@/lib/intake/admin-submissions';
import connectToDatabase from '@/lib/mongodb';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function createSafeFilename(value: string) {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedValue || 'einreichung';
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const rateLimitError = await requireAdminRouteRateLimit(
      request,
      'intake-submission-json-export'
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
    const submissionDetail = await getAdminSubmissionDetail(id);

    if (!submissionDetail) {
      return errorResponse('Intake submission not found', 404);
    }

    const exportPayload = buildAdminSubmissionPrintExport(submissionDetail);
    const filename = `intake-submission-${createSafeFilename(submissionDetail.projectId)}.json`;

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.submission.export.json',
      resourceType: 'submission',
      resourceId: submissionDetail.id,
      required: true,
      metadata: {
        projectId: submissionDetail.projectId,
        format: 'json',
      },
    });

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
