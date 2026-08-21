import { NextRequest, NextResponse } from 'next/server';
import { bulkImportResources } from '@/lib/analytics';
import { requireAdmin } from '@/lib/admin-auth';
import { handleApiError } from '@/lib/utils';

const MAX_BODY_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_RESOURCES = 500;

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  // Check Content-Length header before parsing
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Request body too large. Maximum size is ${MAX_BODY_SIZE_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }

  try {
    const data = await request.json();

    if (!data.resources || !Array.isArray(data.resources)) {
      return NextResponse.json(
        { error: 'Resources array is required' },
        { status: 400 },
      );
    }

    if (data.resources.length > MAX_RESOURCES) {
      return NextResponse.json(
        { error: `Too many resources. Maximum is ${MAX_RESOURCES} per import.` },
        { status: 400 },
      );
    }

    const result = await bulkImportResources(data.resources);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error, 'Failed to import resources');
  }
}
