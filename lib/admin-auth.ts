import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

/**
 * Parse a session cookie value.
 * Format: `{email}:{sessionId}:{signature}`
 * The signature covers `{email}:{sessionId}` to prevent session fixation.
 */
function parseSessionCookie(
  value: string,
): { email: string; sessionId: string; signature: string } | null {
  const parts = value.split(':');
  if (parts.length !== 3) return null;
  const [email, sessionId, signature] = parts;
  if (!email || !sessionId || !signature) return null;
  return { email, sessionId, signature };
}

/**
 * Verify a session cookie value.
 * Returns the admin email if valid, null otherwise.
 */
function verifySessionValue(raw: string): string | null {
  const session = parseSessionCookie(raw);
  if (!session) return null;

  const expected = sign(`${session.email}:${session.sessionId}`);
  const sigBuffer = Buffer.from(session.signature);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  if (!isAllowedAdminEmail(session.email)) return null;

  return session.email;
}

export function isAllowedAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function createAdminSession(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const cookieStore = await cookies();

  // Session rotation: generate a unique session ID on every login.
  // This prevents session fixation attacks where an attacker pre-sets
  // a cookie before the user authenticates.
  const sessionId = randomUUID();
  const signature = sign(`${normalizedEmail}:${sessionId}`);
  const sessionValue = `${normalizedEmail}:${sessionId}:${signature}`;

  // In production (Vercel), always use secure cookies
  const isProduction =
    process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // Generate CSRF token for API requests
  const hmac = createHmac('sha256', getSessionSecret());
  hmac.update(sessionValue);
  const csrfToken = hmac.digest('hex');

  cookieStore.set('csrf_token', csrfToken, {
    httpOnly: false,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  // In production (Vercel), always use secure cookies
  const isProduction =
    process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  // To properly delete a cookie, we need to set it with the same options
  // but with an empty value and past expiration date
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getCurrentAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;

  return verifySessionValue(raw);
}

export async function validateAdminLogin(
  email: string,
  password: string,
): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }

  return isAllowedAdminEmail(email) && password === adminPassword;
}
