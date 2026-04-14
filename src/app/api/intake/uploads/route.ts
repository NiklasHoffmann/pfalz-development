import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { isValidFileSize } from '@/lib/file-utils';
import { getIntakeContextFromSession } from '@/lib/intake/access';
import {
  INTAKE_DEFAULT_MAX_UPLOAD_SIZE,
  INTAKE_DEFAULT_UPLOAD_TYPES,
  INTAKE_SESSION_COOKIE_NAME,
} from '@/lib/intake/constants';
import { decodeIntakeSession } from '@/lib/intake/session';
import {
  buildIntakeStoragePath,
  writeIntakeStorageFile,
} from '@/lib/intake/storage';
import { rateLimit } from '@/lib/rate-limit';
import IntakeFileAsset from '@/models/IntakeFileAsset';
import type {
  IntakeFormSnapshot,
  IntakeQuestionDefinition,
} from '@/types/intake';

export const runtime = 'nodejs';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return candidate;
  }

  return request.headers.get('x-real-ip')?.trim() || 'anonymous';
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
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

function getFileQuestion(
  formSnapshot: IntakeFormSnapshot,
  questionKey: string
): IntakeQuestionDefinition | null {
  for (const section of formSnapshot.sections) {
    const question = section.questions.find(
      (currentQuestion: IntakeQuestionDefinition) =>
        currentQuestion.key === questionKey
    );

    if (question) {
      return question;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(`intake:upload:${getClientIp(request)}`);

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    const formData = await request.formData();
    const submissionId = String(formData.get('submissionId') ?? '').trim();
    const questionKey = String(formData.get('questionKey') ?? '').trim();
    const uploadedFile = formData.get('file');

    if (!submissionId || !questionKey || !isFileLike(uploadedFile)) {
      return errorResponse('Missing upload payload', 400);
    }

    const boundContext = await getSessionBoundContext(request, submissionId);

    if (!boundContext) {
      return errorResponse('Unauthorized intake access', 403);
    }

    if (boundContext.submission.submittedAt) {
      return errorResponse('Submission is already completed', 409);
    }

    const question = getFileQuestion(
      boundContext.accessLink.formSnapshot,
      questionKey
    );

    if (!question || question.fieldType !== 'file') {
      return errorResponse('Upload field not found', 404);
    }

    const allowedMimeTypes = question.validationRules?.allowedMimeTypes?.length
      ? question.validationRules.allowedMimeTypes
      : INTAKE_DEFAULT_UPLOAD_TYPES;
    const maxFileSize =
      question.validationRules?.maxFileSize ?? INTAKE_DEFAULT_MAX_UPLOAD_SIZE;

    if (!allowedMimeTypes.includes(uploadedFile.type)) {
      return errorResponse('File type is not allowed', 415);
    }

    if (!isValidFileSize(uploadedFile.size, maxFileSize)) {
      return errorResponse('File exceeds maximum size', 413);
    }

    const storagePath = buildIntakeStoragePath({
      projectId: boundContext.accessLink.projectId,
      accessLinkId: String(
        boundContext.accessLink.id ?? boundContext.accessLink._id
      ),
      submissionId,
      originalFilename: uploadedFile.name,
    });

    await writeIntakeStorageFile(
      storagePath,
      Buffer.from(await uploadedFile.arrayBuffer())
    );

    const fileAsset = await IntakeFileAsset.create({
      submissionId,
      accessLinkId: String(
        boundContext.accessLink.id ?? boundContext.accessLink._id
      ),
      questionKey,
      storagePath,
      originalFilename: uploadedFile.name,
      mimeType: uploadedFile.type,
      size: uploadedFile.size,
      uploadedAt: new Date(),
      uploadedBy: 'customer',
      scanStatus: 'pending',
    });

    return successResponse(
      {
        file: {
          fileAssetId: String(fileAsset.id ?? fileAsset._id),
          originalFilename: fileAsset.originalFilename,
          mimeType: fileAsset.mimeType,
          size: fileAsset.size,
        },
      },
      'File uploaded successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
