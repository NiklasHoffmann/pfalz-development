import { z } from 'zod';

// Environment Schema
const envSchema = z
  .object({
    // MongoDB
    MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

    // App
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),

    // Logging
    LOG_LEVEL: z
      .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
      .default('info'),

    // API
    API_RATE_LIMIT: z.string().transform(Number).default('100'),
    API_RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),

    // Mail
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.preprocess((value) => {
      if (value === undefined || value === '') return undefined;
      return Number(value);
    }, z.number().int().positive().optional()),
    SMTP_SECURE: z.preprocess((value) => {
      if (value === undefined || value === '') return undefined;
      if (value === true || value === 'true') return true;
      if (value === false || value === 'false') return false;
      return value;
    }, z.boolean().optional()),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM_EMAIL: z.string().email().optional(),
    CONTACT_FROM_EMAIL: z.string().email().optional(),
    CONTACT_TO_EMAIL: z.string().email().optional(),

    // Intake system
    INTAKE_UPLOAD_DIR: z.string().default('storage/intake'),
    INTAKE_SESSION_SECRET: z.string().min(32).optional(),
    INTAKE_SHARE_LINK_SECRET: z.string().min(32).optional(),
    INTAKE_SESSION_DURATION_HOURS: z.string().transform(Number).default('168'),

    // Staff admin auth
    ADMIN_API_KEY: z.string().min(24).optional(),
    ADMIN_ALLOWED_IPS: z.string().optional(),
    ADMIN_SESSION_SECRET: z.string().min(32).optional(),
    ADMIN_SESSION_DURATION_HOURS: z.string().transform(Number).default('12'),
  })
  .superRefine((value, ctx) => {
    const hasTurnstileSiteKey = Boolean(
      value.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
    );
    const hasTurnstileSecretKey = Boolean(value.TURNSTILE_SECRET_KEY?.trim());

    if (hasTurnstileSiteKey !== hasTurnstileSecretKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY must either both be set or both be omitted.',
        path: ['NEXT_PUBLIC_TURNSTILE_SITE_KEY'],
      });
    }

    if (value.NODE_ENV === 'production' && !value.INTAKE_SESSION_SECRET?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'INTAKE_SESSION_SECRET must be set in production for signed intake sessions.',
        path: ['INTAKE_SESSION_SECRET'],
      });
    }

    if (
      value.NODE_ENV === 'production' &&
      !value.INTAKE_SHARE_LINK_SECRET?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'INTAKE_SHARE_LINK_SECRET must be set in production for signed access-link share URLs.',
        path: ['INTAKE_SHARE_LINK_SECRET'],
      });
    }

    if (value.NODE_ENV === 'production' && !value.ADMIN_SESSION_SECRET?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'ADMIN_SESSION_SECRET must be set in production for signed staff admin sessions.',
        path: ['ADMIN_SESSION_SECRET'],
      });
    }
  });

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envValidation.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = envValidation.data;
