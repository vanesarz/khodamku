import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${LARAVEL_API_URL}/profile/password`, {
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
        {
          error: data.message || 'Gagal mengubah kata sandi',
          errors: data.errors,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Kata sandi berhasil diperbarui',
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Terjadi gangguan server saat mengubah kata sandi' },
      { status: 500 }
    );
  }
}
