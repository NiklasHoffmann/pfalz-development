import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { errorResponse, handleApiError } from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
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

function buildDownloadHeaders(
  filename: string,
  mimeType: string,
  disposition: 'attachment' | 'inline' = 'attachment'
) {
  return {
    'Content-Type': mimeType,
    'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'Cache-Control': 'private, no-store',
  };
}

async function hasAdminReadAccess(request: NextRequest) {
  const authState = await requireIntakeAdminAccess(
    request,
    ['admin', 'editor'],
    {
      allowApiKey: true,
    }
  );

  return !('status' in authState);
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

    const boundContext = await getSessionBoundContext(
      request,
      fileAsset.submissionId
    );
    const hasAdminAccess = boundContext
      ? false
      : await hasAdminReadAccess(request);

    if (!boundContext && !hasAdminAccess) {
      return errorResponse('Unauthorized intake access', 403);
    }

    const disposition =
      request.nextUrl.searchParams.get('disposition') === 'inline' &&
      fileAsset.mimeType.startsWith('image/')
        ? 'inline'
        : 'attachment';

    const buffer = await readIntakeStorageFile(fileAsset.storagePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: buildDownloadHeaders(
        fileAsset.originalFilename,
        fileAsset.mimeType,
        disposition
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

    const boundContext = await getSessionBoundContext(
      request,
      fileAsset.submissionId
    );

    if (boundContext) {
      if (boundContext.submission.submittedAt) {
        return errorResponse('Submission is already completed', 409);
      }
    } else {
      const authState = await requireIntakeAdminMutationAccess(
        request,
        ['admin', 'editor'],
        'intake-upload-delete',
        {
          allowApiKey: true,
        }
      );

      if ('status' in authState) {
        return authState;
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
