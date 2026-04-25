import { createHash, randomBytes } from 'node:crypto';

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;

export function generatePasswordResetToken() {
  const rawToken = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');

  return {
    rawToken,
    tokenHash: hashPasswordResetToken(rawToken),
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}
