import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';

const proxy = createMiddleware(routing);

export default proxy;

export const config = {
  // Match all pathnames except API routes, Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
