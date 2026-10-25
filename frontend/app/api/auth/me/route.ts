import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const res = await fetch(`${LARAVEL_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete(USER_COOKIE_NAME);
      response.cookies.delete(ROLE_COOKIE_NAME);
      return response;
    }

    const data = await res.json();
    const user = data.data;

    const response = NextResponse.json({ user });
    const maxAge30Days = 60 * 60 * 24 * 30;

    // Refresh cookies
    response.cookies.set(USER_COOKIE_NAME, JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    response.cookies.set(ROLE_COOKIE_NAME, user?.role || 'pengamal', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    return response;
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Failed to get current user:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
