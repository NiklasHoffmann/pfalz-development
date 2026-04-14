import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { env } from '@/lib/env';
import { INTAKE_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { buildQuestionnairePath } from '@/lib/intake/path';
import { resolveAccessFromToken } from '@/lib/intake/access';
import { encodeIntakeSession } from '@/lib/intake/session';
import { rateLimit } from '@/lib/rate-limit';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return candidate;
  }

  return request.headers.get('x-real-ip')?.trim() || 'anonymous';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`intake:resolve:${ip}`);

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    const body = (await request.json()) as {
      token?: string;
      locale?: string;
    };

    const token = body.token?.trim();
    const locale = body.locale?.trim() || 'de';

    if (!token) {
      return errorResponse('Token is required', 400);
    }

    const resolved = await resolveAccessFromToken(token, locale);

    if (!resolved) {
      return errorResponse('Access link is invalid or expired', 404);
    }

    const response = successResponse(
      {
        formSlug: resolved.accessLink.formSnapshot.slug,
        redirectPath: buildQuestionnairePath(
          locale,
          resolved.accessLink.formSnapshot.slug
        ),
        projectId: resolved.accessLink.projectId,
        customerName: resolved.accessLink.customerName,
        submissionId: resolved.session.submissionId,
      },
      'Access resolved successfully'
    );

    response.cookies.set({
      name: INTAKE_SESSION_COOKIE_NAME,
      value: encodeIntakeSession(resolved.session),
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
      maxAge: env.INTAKE_SESSION_DURATION_HOURS * 60 * 60,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
