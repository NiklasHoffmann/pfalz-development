import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { sendIntakeSubmissionMails } from '@/lib/email';
import { getIntakeContextFromSession } from '@/lib/intake/access';
import {
  INTAKE_PRIVACY_VERSION,
  INTAKE_SESSION_COOKIE_NAME,
} from '@/lib/intake/constants';
import { decodeIntakeSession } from '@/lib/intake/session';
import { validateIntakeSubmission } from '@/lib/intake/validation';
import { logger } from '@/lib/logger';
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`intake:submit:${ip}`);

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
    const validation = validateIntakeSubmission(
      boundContext.accessLink.formSnapshot,
      answers
    );

    if (!validation.isValid) {
      return errorResponse(validation.errors.join(' '), 400);
    }

    const ipHash =
      ip === 'anonymous'
        ? ip
        : createHash('sha256').update(ip).digest('hex').slice(0, 32);

    const updatedSubmission = await IntakeSubmission.findByIdAndUpdate(
      id,
      {
        $set: {
          answers,
          currentStep: body.currentStep ?? boundContext.submission.currentStep,
          progressPercent: 100,
          status: 'vollständig_eingereicht',
          consent: {
            accepted: validation.consentAccepted,
            acceptedAt: new Date(),
            privacyVersion: INTAKE_PRIVACY_VERSION,
            ipHash,
            userAgent: request.headers.get('user-agent') ?? undefined,
          },
          submittedAt: new Date(),
          lastSavedAt: new Date(),
        },
      },
      { new: true }
    ).exec();

    const notificationConfig =
      boundContext.accessLink.formSnapshot.notificationConfig;
    const mailResult = await sendIntakeSubmissionMails({
      formTitle: boundContext.accessLink.formSnapshot.title,
      projectId: boundContext.accessLink.projectId,
      customerName: boundContext.accessLink.customerName,
      customerCompany: boundContext.accessLink.company || undefined,
      customerEmail: boundContext.accessLink.email || undefined,
      customerPhone: boundContext.accessLink.phone || undefined,
      summary: validation.summary,
      internalRecipients: notificationConfig?.internalRecipients,
      internalSubject: notificationConfig?.internalSubject,
      customerConfirmationEnabled:
        notificationConfig?.customerConfirmationEnabled,
      customerSubject: notificationConfig?.customerSubject,
    });

    logger.info(
      `Intake submission completed (submission=${id}, project=${boundContext.accessLink.projectId}, internalMail=${mailResult.internal}, customerMail=${mailResult.customer})`
    );

    return successResponse(
      {
        submission: updatedSubmission,
        delivery: mailResult,
      },
      'Submission completed successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
