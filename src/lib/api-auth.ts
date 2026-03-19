import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { errorResponse } from './api-response';

const ADMIN_HEADER = 'x-admin-key';

function safeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function requireAdminApiKey(request: NextRequest) {
  const configuredKey = process.env.ADMIN_API_KEY?.trim();
  const providedKey = request.headers.get(ADMIN_HEADER)?.trim();

  // Fail closed: if no key is configured, the endpoint remains unavailable.
  if (
    !configuredKey ||
    !providedKey ||
    !safeEquals(providedKey, configuredKey)
  ) {
    return errorResponse('Not found', 404);
  }

  return null;
}
