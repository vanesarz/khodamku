import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const res = await fetch(`${LARAVEL_API_URL}/admin/khodam/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.message || 'Khodam tidak ditemukan' }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: json.data });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Khodam detail error:', error);
    return NextResponse.json({ error: 'Gagal memuat detail khodam' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let res: Response;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      res = await fetch(`${LARAVEL_API_URL}/admin/khodam/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });
    } else {
      const body = await request.json();
      res = await fetch(`${LARAVEL_API_URL}/admin/khodam/${id}`, {
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
        { error: json.message || 'Gagal memperbarui khodam', errors: json.errors },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data khodam berhasil diperbarui',
      data: json.data,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Khodam update error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memperbarui khodam' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const res = await fetch(`${LARAVEL_API_URL}/admin/khodam/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json.message || 'Gagal menghapus khodam' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Khodam berhasil dihapus dari padepokan',
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Khodam delete error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghapus khodam' }, { status: 500 });
  }
}
