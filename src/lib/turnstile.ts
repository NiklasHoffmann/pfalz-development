import { env } from './env';

type TurnstileVerificationResponse = {
  success: boolean;
  'error-codes'?: string[];
};

export function isTurnstileEnabled(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() && env.TURNSTILE_SECRET_KEY?.trim()
  );
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  if (!isTurnstileEnabled()) {
    return true;
  }

  const params = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY!,
    response: token,
  });

  if (remoteIp && remoteIp !== 'anonymous') {
    params.set('remoteip', remoteIp);
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as TurnstileVerificationResponse;
  return result.success;
}