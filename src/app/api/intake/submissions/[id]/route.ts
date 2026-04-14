import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { getIntakeContextFromSession } from '@/lib/intake/access';
import { INTAKE_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { decodeIntakeSession } from '@/lib/intake/session';
import { rateLimit } from '@/lib/rate-limit';
import IntakeSubmission from '@/models/IntakeSubmission';
import { intakeDraftUpdateSchema } from '@/schemas/intake/submission.schema';
import type { IntakeAnswer } from '@/types/intake';

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const boundContext = await getSessionBoundContext(request, id);

    if (!boundContext) {
      return errorResponse('Unauthorized intake access', 403);
    }

    return successResponse({
      submission: boundContext.submission,
      formSnapshot: boundContext.accessLink.formSnapshot,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const rateLimitResult = rateLimit(`intake:draft:${getClientIp(request)}`);

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    const boundContext = await getSessionBoundContext(request, id);

    if (!boundContext) {
      return errorResponse('Unauthorized intake access', 403);
    }

    if (boundContext.submission.submittedAt) {
      return errorResponse('Submission is already completed', 409);
    }

    const body = intakeDraftUpdateSchema.parse(await request.json());
    const answers = body.answers as IntakeAnswer[];

    const nextStatus =
      (body.progressPercent ?? boundContext.submission.progressPercent) > 0
        ? 'teilweise_ausgefüllt'
        : 'begonnen';

    const updatedSubmission = await IntakeSubmission.findByIdAndUpdate(
      id,
      {
        $set: {
          answers,
          currentStep: body.currentStep ?? boundContext.submission.currentStep,
          progressPercent:
            body.progressPercent ?? boundContext.submission.progressPercent,
          status: nextStatus,
          lastSavedAt: new Date(),
        },
      },
      { new: true }
    ).exec();

    return successResponse(
      {
        submission: updatedSubmission,
      },
      'Draft updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
