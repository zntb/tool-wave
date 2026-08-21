import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';
import { requireCsrfToken } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  const csrfResult = await requireCsrfToken(request);
  if (csrfResult !== true) return csrfResult;

  await clearAdminSession();
  return NextResponse.json({ success: true });
}
