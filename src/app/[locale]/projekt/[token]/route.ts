import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { resolveAccessFromToken } from '@/lib/intake/access';
import { INTAKE_SESSION_COOKIE_NAME } from '@/lib/intake/constants';
import { buildQuestionnairePath } from '@/lib/intake/path';
import { encodeIntakeSession } from '@/lib/intake/session';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string; token: string }> }
) {
  const { locale, token } = await context.params;
  const resolved = await resolveAccessFromToken(token, locale);

  if (!resolved) {
    return new NextResponse(
      'Dieser Zugangslink ist ungueltig oder abgelaufen.',
      {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }

  const response = NextResponse.redirect(
    new URL(
      buildQuestionnairePath(locale, resolved.accessLink.formSnapshot.slug),
      request.url
    ),
    307
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
}
