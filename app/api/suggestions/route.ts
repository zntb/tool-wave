import { NextRequest, NextResponse } from 'next/server';
import { getAutocompleteSuggestionsAction } from '@/app/actions';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'suggestions',
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const categorySlug = searchParams.get('category');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const result = await getAutocompleteSuggestionsAction(
    query.trim(),
    categorySlug || undefined,
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to get suggestions' },
      { status: 500 },
    );
  }

  return NextResponse.json({ suggestions: result.data || [] });
}
