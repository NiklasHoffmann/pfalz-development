import { z } from 'zod';

/**
 * `next build` loads every route module to collect page data, so this file runs
 * during the build too. Runtime-only secrets (DB URI, signing keys) are not
 * available in every build environment (CI, a bare `docker build`), so during
 * the build phase a failed validation is downgraded to a warning and safe
 * defaults are used. At runtime the validation stays strict and aborts the
 * process when something is missing. Set SKIP_ENV_VALIDATION=true to force the
 * lenient path explicitly.
 */
const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

// Environment Schema
const envFields = z.object({
  // MongoDB
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  // App
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Headless Chromium for invoice PDF rendering. Set in the Docker image;
  // locally point this at a Chrome/Edge binary.
  PUPPETEER_EXECUTABLE_PATH: z.string().min(1).optional(),

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
  ADMIN_ENFORCE_IP_ALLOWLIST: z.preprocess((value) => {
    if (value === undefined || value === '') return true;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  }, z.boolean()),
  ADMIN_ALLOWED_IPS: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  ADMIN_SESSION_DURATION_HOURS: z.string().transform(Number).default('12'),
  ADMIN_PROXY_SHARED_SECRET: z.string().min(24).optional(),
});

const envSchema = envFields.superRefine((value, ctx) => {
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

  // Runtime-only requirements: skip while building, enforce when serving.
  if (isBuildPhase) {
    return;
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

/**
 * Lenient fallback used only when the strict parse fails during `next build`.
 * Fields that can legitimately be absent in a build environment fall back to
 * their local-development defaults so the build can finish.
 */
const buildEnvSchema = envFields.extend({
  MONGODB_URI: z
    .string()
    .min(1)
    .catch('mongodb://localhost:27017/nextjs-starter'),
  NEXT_PUBLIC_APP_URL: z.string().url().catch('http://localhost:3000'),
  ADMIN_APP_URL: z.string().url().optional().catch(undefined),
});

type Env = z.infer<typeof envFields>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (result.success) {
    return result.data;
  }

  const fieldErrors = result.error.flatten().fieldErrors;

  if (isBuildPhase) {
    console.warn(
      `⚠️  Build phase: using fallback defaults for ${Object.keys(fieldErrors).join(', ')} — real values are required at runtime.`
    );
    return buildEnvSchema.parse(process.env);
  }

  console.error('❌ Invalid environment variables:');
  console.error(fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = loadEnv();
