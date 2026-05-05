type ContentSecurityPolicyOptions = {
  enforceHttpsUpgrade: boolean;
  isDevelopment?: boolean;
};

export const NONCE_HEADER_NAME = 'x-nonce';

export function buildContentSecurityPolicy(
  nonce: string,
  { enforceHttpsUpgrade, isDevelopment = false }: ContentSecurityPolicyOptions
) {
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    'https://challenges.cloudflare.com',
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
  ];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https://challenges.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    ...(enforceHttpsUpgrade ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}
