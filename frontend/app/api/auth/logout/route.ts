import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (token) {
      try {
        await fetch(`${LARAVEL_API_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      } catch (err) {
        console.error('Failed to notify backend about logout:', err);
      }
    }

    // Always clear cookies
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);
    cookieStore.delete(ROLE_COOKIE_NAME);

    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan logout' },
      { status: 500 }
    );
  }
}
