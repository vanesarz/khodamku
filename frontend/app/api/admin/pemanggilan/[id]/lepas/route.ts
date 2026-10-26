import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

// Pelepasan diteruskan ke Laravel; status hanya berubah bila backend menyatakan berhasil
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { id } = await params;

    const res = await fetch(`${LARAVEL_API_URL}/admin/pemanggilan/${id}/lepas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.message || 'Gagal melepaskan khodam' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: json?.message || 'Khodam berhasil dilepaskan dari raga pengamal. Kontrak telah selesai.',
      released_id: Number(id),
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Pelepasan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses pelepasan' },
      { status: 500 }
    );
  }
}
