import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .regex(
      /^mongodb(\+srv)?:\/\//i,
      'DATABASE_URL must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)',
    ),
  ADMIN_EMAILS: z
    .string()
    .min(1, 'ADMIN_EMAILS is required')
    .refine(
      val =>
        val
          .split(',')
          .map(e => e.trim())
          .filter(Boolean)
          .every(e => e.includes('@')),
      'ADMIN_EMAILS must be a comma-separated list of valid email addresses',
    ),
  ADMIN_PASSWORD: z
    .string()
    .min(1, 'ADMIN_PASSWORD is required')
    .min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  ADMIN_SESSION_SECRET: z
    .string()
    .min(1, 'ADMIN_SESSION_SECRET is required')
    .min(16, 'ADMIN_SESSION_SECRET must be at least 16 characters'),
});

type EnvVars = z.infer<typeof envSchema>;

let _env: EnvVars | null = null;

/**
 * Validate environment variables. Throws a clear error on first call
 * if any variable is missing or malformed. Subsequent calls return
 * the cached result.
 */
export function getEnv(): EnvVars {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map(i => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment variables:\n${issues}\n\nCheck your .env file or hosting environment.`,
    );
  }

  _env = result.data;
  return _env;
}
