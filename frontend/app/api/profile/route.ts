import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const res = await fetch(`${LARAVEL_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Gagal memuat profil' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${LARAVEL_API_URL}/profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message, errors: data.errors },
        { status: res.status }
      );
    }

    // Update user cookie with new profile data
    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(data.data), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      message: data.message || 'Profil berhasil diperbarui',
      data: data.data,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profil' },
      { status: 500 }
    );
  }
}
