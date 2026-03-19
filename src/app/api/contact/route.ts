import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { sendContactMail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { contactSchema } from '@/schemas/contact.schema';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return candidate;
  }

  return request.headers.get('x-real-ip')?.trim() || 'anonymous';
}

function ipFingerprint(ip: string): string {
  if (ip === 'anonymous') {
    return ip;
  }

  return createHash('sha256').update(ip).digest('hex').slice(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(`contact:${ip}`);

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    const body = await request.json();
    const submission = contactSchema.parse(body);

    if (submission.website) {
      return successResponse({ received: true }, 'Message received');
    }

    logger.info(
      `Contact request received (ipfp=${ipFingerprint(ip)}, business=${submission.business ? 'yes' : 'no'}, phone=${submission.phone ? 'yes' : 'no'})`
    );

    const mailResult = await sendContactMail(submission);

    if (!mailResult.sent) {
      logger.warn(
        'Contact email was not sent because SMTP configuration is incomplete.'
      );
    }

    return successResponse(
      {
        received: true,
        delivery: mailResult.reason,
        rateLimit: {
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.reset).toISOString(),
        },
      },
      'Message received successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
