import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { errorResponse, handleApiError } from '@/lib/api-response';
import { hasValidAdminApiKey } from '@/lib/api-auth';
import { getIntakeContextFromSession } from '@/lib/intake/access';
import { INTAKE_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { decodeIntakeSession } from '@/lib/intake/session';
import {
  readIntakeStorageFile,
  removeIntakeStorageFile,
} from '@/lib/intake/storage';
import { rateLimit } from '@/lib/rate-limit';
import IntakeFileAsset from '@/models/IntakeFileAsset';

export const runtime = 'nodejs';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return candidate;
  }

  return request.headers.get('x-real-ip')?.trim() || 'anonymous';
}

async function getSessionBoundContext(
  request: NextRequest,
  submissionId: string
) {
  const session = decodeIntakeSession(
    request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value
  );

  if (!session || session.submissionId !== submissionId) {
    return null;
  }

  return getIntakeContextFromSession(session, session.formSlug);
}

function buildDownloadHeaders(filename: string, mimeType: string) {
  return {
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'Cache-Control': 'private, no-store',
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    await connectToDatabase();
    const { fileId } = await context.params;
    const fileAsset = await IntakeFileAsset.findById(fileId).exec();

    if (!fileAsset) {
      return errorResponse('File not found', 404);
    }

    const hasAdminAccess = hasValidAdminApiKey(request);

    if (!hasAdminAccess) {
      const boundContext = await getSessionBoundContext(
        request,
        fileAsset.submissionId
      );

      if (!boundContext) {
        return errorResponse('Unauthorized intake access', 403);
      }
    }

    const buffer = await readIntakeStorageFile(fileAsset.storagePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: buildDownloadHeaders(
        fileAsset.originalFilename,
        fileAsset.mimeType
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    const rateLimitResult = rateLimit(
      `intake:file-delete:${getClientIp(request)}`
    );

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    await connectToDatabase();
    const { fileId } = await context.params;
    const fileAsset = await IntakeFileAsset.findById(fileId).exec();

    if (!fileAsset) {
      return errorResponse('File not found', 404);
    }

    const hasAdminAccess = hasValidAdminApiKey(request);

    if (!hasAdminAccess) {
      const boundContext = await getSessionBoundContext(
        request,
        fileAsset.submissionId
      );

      if (!boundContext) {
        return errorResponse('Unauthorized intake access', 403);
      }

      if (boundContext.submission.submittedAt) {
        return errorResponse('Submission is already completed', 409);
      }
    }

    await removeIntakeStorageFile(fileAsset.storagePath);
    await IntakeFileAsset.findByIdAndDelete(fileId).exec();

    return NextResponse.json({
      success: true,
      data: {
        deleted: true,
        fileId,
      },
      message: 'File deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
