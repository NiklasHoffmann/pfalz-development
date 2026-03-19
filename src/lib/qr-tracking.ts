import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { logger } from '@/lib/logger';
import QrScan from '@/models/QrScan';

type QrCode = 'vk' | 'fl' | 'pub';

const campaigns: Record<QrCode, 'visitenkarte' | 'flyer' | 'public_display'> = {
  vk: 'visitenkarte',
  fl: 'flyer',
  pub: 'public_display',
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();

  if (candidate) {
    return candidate;
  }

  return request.headers.get('x-real-ip')?.trim() || 'anonymous';
}

function buildTargetUrl(request: NextRequest, code: QrCode): string {
  const url = new URL('/', request.url);
  url.searchParams.set('utm_source', 'qr');
  url.searchParams.set('utm_medium', 'offline');
  url.searchParams.set('utm_campaign', campaigns[code]);
  return url.toString();
}

export async function trackQrAndRedirect(
  request: NextRequest,
  code: QrCode
): Promise<NextResponse> {
  const targetUrl = buildTargetUrl(request, code);

  try {
    await connectToDatabase();

    await QrScan.create({
      code,
      campaign: campaigns[code],
      source: 'qr',
      medium: 'offline',
      targetUrl,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') ?? undefined,
      referer: request.headers.get('referer') ?? undefined,
    });
  } catch (error) {
    // Redirect should still work even if DB logging fails temporarily.
    logger.warn(`QR tracking write failed for ${code}: ${String(error)}`);
  }

  return NextResponse.redirect(targetUrl, 307);
}
