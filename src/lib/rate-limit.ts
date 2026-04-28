import { env } from './env';
import connectToDatabase from './mongodb';
import AdminRateLimit from '@/models/AdminRateLimit';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export function rateLimit(
  identifier: string,
  options?: RateLimitOptions
): {
  success: boolean;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const limit = options?.limit ?? env.API_RATE_LIMIT;
  const window = options?.windowMs ?? env.API_RATE_LIMIT_WINDOW;

  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    // Create or reset record
    store.set(identifier, {
      count: 1,
      resetTime: now + window,
    });

    return {
      success: true,
      remaining: limit - 1,
      reset: now + window,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count++;

  return {
    success: true,
    remaining: limit - record.count,
    reset: record.resetTime,
  };
}

export async function rateLimitPersistent(
  identifier: string,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  await connectToDatabase();

  const now = new Date();
  const limit = options?.limit ?? env.API_RATE_LIMIT;
  const windowDuration = options?.windowMs ?? env.API_RATE_LIMIT_WINDOW;
  const nextReset = new Date(now.getTime() + windowDuration);
  const windowExpiredExpression = {
    $or: [{ $eq: ['$resetAt', null] }, { $lte: ['$resetAt', now] }],
  };

  const record = await AdminRateLimit.findOneAndUpdate(
    { identifier },
    [
      {
        $set: {
          identifier,
          createdAt: { $ifNull: ['$createdAt', now] },
          updatedAt: now,
          count: {
            $cond: [
              windowExpiredExpression,
              1,
              { $add: [{ $ifNull: ['$count', 0] }, 1] },
            ],
          },
          resetAt: {
            $cond: [windowExpiredExpression, nextReset, '$resetAt'],
          },
        },
      },
    ],
    {
      new: true,
      upsert: true,
    }
  )
    .lean<{ count: number; resetAt: Date }>()
    .exec();

  if (!record) {
    throw new Error(`Unable to persist rate limit state for ${identifier}`);
  }

  const remaining = Math.max(0, limit - record.count);

  return {
    success: record.count <= limit,
    remaining,
    reset: new Date(record.resetAt).getTime(),
  };
}

/**
 * Clean up old entries periodically
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
