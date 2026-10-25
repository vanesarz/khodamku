import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

// Initial fallback categories
const DEFAULT_KATEGORIS = [
  { id: 1, nama: 'Penjaga Rumah', deskripsi: 'Entitas penjaga batas pekarangan dan kediaman dari gangguan gaib.' },
  { id: 2, nama: 'Penglaris Dagangan', deskripsi: 'Penarik energi kemakmuran dan pelancar transaksi perniagaan.' },
  { id: 3, nama: 'Pelindung Ujian', deskripsi: 'Membantu ketenangan batin, kejernihan pikiran, dan fokus belajar.' },
  { id: 4, nama: 'Kewibawaan', deskripsi: 'Meningkatkan karisma, disegani kawan maupun lawan.' },
  { id: 5, nama: 'Penolak Bala', deskripsi: 'Menangkal teluh, santet, dan marabahaya gaib tingkat tinggi.' },
  { id: 6, nama: 'Pencari Jodoh', deskripsi: 'Membuka pancaran aura asmara dan mempertemukan jodoh sejati.' },
];

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    if (token) {
      const res = await fetch(`${LARAVEL_API_URL}/admin/kelola/kategori?search=${encodeURIComponent(search)}`, {
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

    // Fallback
    let filtered = DEFAULT_KATEGORIS;
    if (search) {
      filtered = filtered.filter((k) =>
        k.nama.toLowerCase().includes(search.toLowerCase()) ||
        k.deskripsi.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Kategori GET error:', error);
    return NextResponse.json({ success: true, data: DEFAULT_KATEGORIS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${LARAVEL_API_URL}/admin/kelola/kategori`, {
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
        { error: json.message || 'Gagal menambahkan kategori', errors: json.errors },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: json.data,
    }, { status: 201 });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Kategori POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menambahkan kategori' }, { status: 500 });
  }
}
