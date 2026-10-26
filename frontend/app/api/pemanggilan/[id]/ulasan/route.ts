import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const res = await fetch(`${LARAVEL_API_URL}/pemanggilan/${id}/ulasan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), { status: res.status });
}