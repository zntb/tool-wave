import { createHmac } from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const ADMIN_SESSION_COOKIE = 'admin_session';

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return secret;
}

/**
 * Generate a CSRF token tied to the current session.
 * The token is an HMAC of the session cookie value.
 */
export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || '';

  const hmac = createHmac('sha256', getSecret());
  hmac.update(session);
  const token = hmac.digest('hex');

  // Set the token as a cookie so the client can read it
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false, // Client needs to read this
    sameSite: 'strict',
    secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Validate a CSRF token from a request header against the session.
 * Returns true if the token is valid.
 */
export async function validateCsrfToken(
  tokenFromHeader: string | null,
): Promise<boolean> {
  if (!tokenFromHeader) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || '';

  const hmac = createHmac('sha256', getSecret());
  hmac.update(session);
  const expected = hmac.digest('hex');

  // Constant-time comparison
  if (tokenFromHeader.length !== expected.length) return false;

  const a = Buffer.from(tokenFromHeader);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i]! ^ b[i]!;
  }
  return result === 0;
}

/**
 * Helper to extract and validate CSRF token from a Request object.
 * Returns a NextResponse with 403 if invalid, or null if valid.
 */
export async function requireCsrfToken(
  request: Request,
): Promise<true | Response> {
  const token = request.headers.get(CSRF_HEADER);
  const valid = await validateCsrfToken(token);
  if (!valid) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing CSRF token' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }
  return true;
}
