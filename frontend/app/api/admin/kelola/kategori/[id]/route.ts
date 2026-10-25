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

    const res = await fetch(`${LARAVEL_API_URL}/admin/kelola/kategori/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.message || 'Kategori tidak ditemukan' }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: json.data });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Kategori detail error:', error);
    return NextResponse.json({ error: 'Gagal memuat detail kategori' }, { status: 500 });
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

    const body = await request.json();

    const res = await fetch(`${LARAVEL_API_URL}/admin/kelola/kategori/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json.message || 'Gagal memperbarui kategori', errors: json.errors },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: json.data,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Kategori update error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memperbarui kategori' }, { status: 500 });
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

    const res = await fetch(`${LARAVEL_API_URL}/admin/kelola/kategori/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json.message || 'Gagal menghapus kategori' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Kategori delete error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghapus kategori' }, { status: 500 });
  }
}
