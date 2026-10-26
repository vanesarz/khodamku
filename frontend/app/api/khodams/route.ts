import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

// Katalog pengamal: diteruskan ke Laravel GET /khodam (status ketersediaan dihitung di backend)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const res = await fetch(`${LARAVEL_API_URL}/khodam`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.message || 'Gagal memuat katalog khodam' }, { status: res.status });
    }

    const khodams: any[] = json.data || [];

    return NextResponse.json({
      success: true,
      data: khodams,
      summary: {
        total: khodams.length,
        tersedia: khodams.filter((k) => k.is_tersedia).length,
        bersemayam: khodams.filter((k) => !k.is_tersedia).length,
      },
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Error fetching khodams:', error);
    return NextResponse.json({ error: 'Gagal memuat status ketersediaan khodam' }, { status: 500 });
  }
}
