import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { MASTER_KHODAMS } from '@/lib/khodamData';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kategoriId = searchParams.get('kategori_id') || '';
    const hanyaTersedia = searchParams.get('hanya_tersedia') || '';

    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (kategoriId) queryParams.set('kategori_id', kategoriId);
    if (hanyaTersedia) queryParams.set('hanya_tersedia', hanyaTersedia);

    if (token) {
      const res = await fetch(`${LARAVEL_API_URL}/admin/khodam?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({
          success: true,
          data: json.data || [],
        });
      }
    }

    // Fallback if token missing or backend error
    let list = MASTER_KHODAMS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((k) =>
        k.nama.toLowerCase().includes(q) ||
        k.kode_khodam.toLowerCase().includes(q) ||
        k.asal.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Admin Khodam GET error:', error);
    return NextResponse.json({ success: true, data: MASTER_KHODAMS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let res: Response;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      res = await fetch(`${LARAVEL_API_URL}/admin/khodam`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });
    } else {
      const body = await request.json();
      res = await fetch(`${LARAVEL_API_URL}/admin/khodam`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json.message || 'Gagal menambahkan khodam', errors: json.errors },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Khodam berhasil ditambahkan ke padepokan',
      data: json.data,
    }, { status: 201 });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Admin Khodam POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menambahkan khodam' }, { status: 500 });
  }
}
