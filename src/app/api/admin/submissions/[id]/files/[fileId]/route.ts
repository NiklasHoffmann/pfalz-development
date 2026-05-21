import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, handleApiError } from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import { readIntakeStorageFile } from '@/lib/intake/storage';
import connectToDatabase from '@/lib/mongodb';
import IntakeFileAsset from '@/models/IntakeFileAsset';

interface RouteContext {
  params: Promise<{ id: string; fileId: string }>;
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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id, fileId } = await context.params;
    const fileAsset = await IntakeFileAsset.findById(fileId).exec();

    if (!fileAsset || fileAsset.submissionId !== id) {
      return errorResponse('File not found', 404);
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
