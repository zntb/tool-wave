import { NextRequest, NextResponse } from 'next/server';
import {
  createResourceSubmission,
  getResourceSubmissions,
  updateResourceSubmissionStatus,
  deleteResourceSubmission,
} from '@/lib/analytics';
import { getCurrentAdminEmail } from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireCsrfToken } from '@/lib/csrf';
import { sanitizeString, sanitizeOptional } from '@/lib/sanitize';
import { checkSSRF } from '@/lib/ssrf-prevention';

// Create a new resource submission (public endpoint)
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'submission',
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 },
      );
    }

    // SSRF prevention: reject URLs pointing to private/internal IPs
    const ssrfCheck = await checkSSRF(data.url);
    if (!ssrfCheck.allowed) {
      return NextResponse.json(
        { error: `Invalid URL: ${ssrfCheck.reason}` },
        { status: 400 },
      );
    }

    const submission = await createResourceSubmission({
      title: sanitizeString(data.title),
      url: data.url,
      description: sanitizeOptional(data.description),
      icon: sanitizeOptional(data.icon),
      category: sanitizeOptional(data.category),
      submitter: sanitizeOptional(data.submitter),
      email: sanitizeOptional(data.email),
    });

    return NextResponse.json(
      { success: true, data: submission },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create submission',
      },
      { status: 500 },
    );
  }
}

// Get all submissions (admin only)
export async function GET(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | undefined;

  try {
    const submissions = await getResourceSubmissions(status);
    return NextResponse.json(
      { success: true, data: submissions },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch submissions',
      },
      { status: 500 },
    );
  }
}

// Update submission status (admin only)
export async function PATCH(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csrfResult = await requireCsrfToken(request);
  if (csrfResult !== true) return csrfResult;

  try {
    const data = await request.json();

    if (!data.id || !data.status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 },
      );
    }

    const submission = await updateResourceSubmissionStatus(
      data.id,
      data.status,
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: submission },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update submission',
      },
      { status: 500 },
    );
  }
}

// Delete submission (admin only)
export async function DELETE(request: NextRequest) {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csrfResult = await requireCsrfToken(request);
  if (csrfResult !== true) return csrfResult;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await deleteResourceSubmission(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete submission',
      },
      { status: 500 },
    );
  }
}
