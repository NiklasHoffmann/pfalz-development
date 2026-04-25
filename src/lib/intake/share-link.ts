import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';
import { INTAKE_DEV_SHARE_LINK_SECRET } from './constants';

const SHARE_TOKEN_SEPARATOR = '~';

function getShareLinkSecret() {
  const configuredSecret = env.INTAKE_SHARE_LINK_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('INTAKE_SHARE_LINK_SECRET must be configured in production');
  }

  return INTAKE_DEV_SHARE_LINK_SECRET;
}

function signShareLinkValue(value: string) {
  return createHmac('sha256', getShareLinkSecret())
    .update(value)
    .digest('base64url');
}

export function createAccessLinkShareToken(accessLinkId: string) {
  const normalizedAccessLinkId = accessLinkId.trim();
  return `${normalizedAccessLinkId}${SHARE_TOKEN_SEPARATOR}${signShareLinkValue(normalizedAccessLinkId)}`;
}

export function verifyAccessLinkShareToken(shareToken: string) {
  const separatorIndex = shareToken.lastIndexOf(SHARE_TOKEN_SEPARATOR);

  if (separatorIndex <= 0) {
    return null;
  }

  const accessLinkId = shareToken.slice(0, separatorIndex).trim();
  const providedSignature = shareToken.slice(separatorIndex + 1).trim();

  if (!accessLinkId || !providedSignature) {
    return null;
  }

  const expectedSignature = signShareLinkValue(accessLinkId);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  return accessLinkId;
}
