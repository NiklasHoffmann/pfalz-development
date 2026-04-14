import { createHash, randomBytes } from 'node:crypto';

export function generateIntakeToken(size: number = 32): string {
  return randomBytes(size).toString('base64url');
}

export function hashIntakeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getIntakeTokenPreview(token: string): string {
  return token.slice(0, 8);
}
