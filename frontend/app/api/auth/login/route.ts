import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi' },
        { status: 422 }
      );
    }

    const res = await fetch(`${LARAVEL_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: data.message || 'Kredensial tidak valid',
          errors: data.errors,
        },
        { status: res.status }
      );
    }

    const cookieStore = await cookies();
    const maxAge30Days = 60 * 60 * 24 * 30; // 30 days persistent cookie

    // 1. Secure HttpOnly cookie for the Bearer token
    cookieStore.set(AUTH_COOKIE_NAME, data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    // 2. User profile cookie for client hydration
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    // 3. User role cookie for middleware routing
    cookieStore.set(ROLE_COOKIE_NAME, data.user?.role || 'pengamal', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    return NextResponse.json({
      success: true,
      message: data.message,
      user: data.user,
    });
  } catch (error) {
    console.error('Error during login proxy:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server autentikasi' },
      { status: 500 }
    );
  }
}
