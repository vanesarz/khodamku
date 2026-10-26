import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/auth';
import { formatDateFull, toIsoDate } from '@/lib/dateUtils';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' };
}

function pengamalDariCookie(request: NextRequest): { name: string; email: string } {
  try {
    const parsed = JSON.parse(request.cookies.get(USER_COOKIE_NAME)?.value || '{}');
    return { name: parsed.name || 'Pengamal', email: parsed.email || '' };
  } catch {
    return { name: 'Pengamal', email: '' };
  }
}

/**
 * Ubah transaksi dari Laravel ke bentuk data yang dipakai halaman pengamal.
 * `aktif` berisi data GET /pemanggilan/aktif (badge dan detail khodam) bila transaksi masih aktif.
 */
function keBentukHalaman(item: any, pengamal: { name: string; email: string }, aktif?: any) {
  const kode = item.khodam?.kode_khodam || '';

  return {
    id: item.id,
    kode_transaksi: item.kode_transaksi,
    pengamal: pengamal.name,
    pengamal_email: pengamal.email,
    khodam: {
      id: aktif?.khodam?.id ?? item.khodam?.id,
      nama: item.khodam?.nama,
      kode_khodam: kode,
      sigil: kode.split('-')[1] || 'KHD',
      asal: aktif?.khodam?.asal ?? '',
      level_kekuatan: aktif?.khodam?.level_kekuatan ?? 0,
    },
    tgl_panggil_raw: toIsoDate(item.tgl_panggil, false),
    tgl_panggil: formatDateFull(item.tgl_panggil, false),
    tgl_jatuh_tempo_raw: toIsoDate(item.tgl_jatuh_tempo, false),
    tgl_jatuh_tempo: formatDateFull(item.tgl_jatuh_tempo, false),
    tgl_pelepasan_raw: item.tgl_pelepasan ? toIsoDate(item.tgl_pelepasan, false) : null,
    tgl_pelepasan: item.tgl_pelepasan ? formatDateFull(item.tgl_pelepasan, false) : '—',
    mahar: Number(item.mahar) || 0,
    mahar_formatted: item.mahar_formatted,
    status: item.status as 'Aktif' | 'Terlambat' | 'Dilepas',
    is_terlambat: item.status === 'Terlambat',
    rating: item.rating ?? null,
    status_badge: aktif?.status_badge ?? item.status,
  };
}

// Pemanggilan saya + riwayat: gabungan Laravel GET /riwayat dan GET /pemanggilan/aktif
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const [resRiwayat, resAktif] = await Promise.all([
      fetch(`${LARAVEL_API_URL}/riwayat`, { headers: headers(token), cache: 'no-store' }),
      fetch(`${LARAVEL_API_URL}/pemanggilan/aktif`, { headers: headers(token), cache: 'no-store' }),
    ]);

    const riwayat = await resRiwayat.json();
    const aktif = await resAktif.json();

    if (!resRiwayat.ok) {
      return NextResponse.json({ error: riwayat.message || 'Gagal memuat data pemanggilan' }, { status: resRiwayat.status });
    }

    const aktifPerId = new Map<number, any>((resAktif.ok ? aktif.data : []).map((a: any) => [a.id, a]));
    const pengamal = pengamalDariCookie(request);

    return NextResponse.json({
      success: true,
      data: (riwayat.data || []).map((item: any) => keBentukHalaman(item, pengamal, aktifPerId.get(item.id))),
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Pemanggilan saya fetch error:', error);
    return NextResponse.json({ error: 'Gagal memuat data pemanggilan pengguna' }, { status: 500 });
  }
}

// Pemanggilan baru: diteruskan ke Laravel POST /pemanggilan (durasi tetap 5 hari di backend)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Harap masuk ke akunmu terlebih dahulu' }, { status: 401 });
    }

    const { khodam_id } = await request.json();
    if (!khodam_id) {
      return NextResponse.json({ error: 'Entitas khodam yang hendak dipanggil wajib dipilih' }, { status: 422 });
    }

    const res = await fetch(`${LARAVEL_API_URL}/pemanggilan`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ khodam_id }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.message || 'Gagal memanggil khodam' }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      message: `Ritual berhasil disempurnakan! Khodam ${json.data?.khodam?.nama ?? ''} kini bersemayam di ragamu.`,
      data: json.data,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Pemanggilan ritual error:', error);
    return NextResponse.json({ error: 'Terjadi gangguan saat memproses pemanggilan' }, { status: 500 });
  }
}
