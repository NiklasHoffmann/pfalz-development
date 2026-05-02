import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { siteConfig } from '@/config/site';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { isTurnstileEnabled, verifyTurnstileToken } from '@/lib/turnstile';

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
    const rateLimitResult = rateLimit(`reveal-email:${ip}`, {
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    if (!isTurnstileEnabled()) {
      logger.warn(
        `Email reveal attempted without Turnstile (ipfp=${ipFingerprint(ip)})`
      );
      return errorResponse('Email reveal is currently unavailable', 503);
    }

    const body = (await request.json()) as {
      turnstileToken?: string;
    };

    if (!body.turnstileToken?.trim()) {
      logger.warn(
        `Email reveal missing Turnstile token (ipfp=${ipFingerprint(ip)})`
      );
      return errorResponse('Spam protection verification failed', 400);
    }

    const isTurnstileValid = await verifyTurnstileToken(
      body.turnstileToken,
      ip
    );

    if (!isTurnstileValid) {
      logger.warn(
        `Email reveal blocked by Turnstile (ipfp=${ipFingerprint(ip)})`
      );
      return errorResponse('Spam protection verification failed', 400);
    }

    logger.info(`Email reveal granted (ipfp=${ipFingerprint(ip)})`);

    return successResponse({
      mailto: `mailto:${siteConfig.contact.email}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
