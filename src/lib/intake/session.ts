import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';
import { INTAKE_DEV_SESSION_SECRET } from './constants';
import type { IntakeSessionPayload } from '@/types/intake';

function getSessionSecret(): string {
  const configuredSecret = env.INTAKE_SESSION_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('INTAKE_SESSION_SECRET must be configured in production');
  }

  return INTAKE_DEV_SESSION_SECRET;
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

export function encodeIntakeSession(payload: IntakeSessionPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  );
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function decodeIntakeSession(
  value: string | undefined
): IntakeSessionPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as IntakeSessionPayload;
  } catch {
    return null;
  }
}
