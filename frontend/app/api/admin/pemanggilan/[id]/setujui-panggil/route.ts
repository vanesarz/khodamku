import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { toIsoDate, formatDateFull, addDays, getStartOfToday } from '@/lib/dateUtils';
import {
  SUMMONED_COOKIE_NAME,
  parseSummonedContracts,
} from '@/lib/customPemanggilan';

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
    const numId = Number(id);
    const today = getStartOfToday();
    const maxAge30Days = 60 * 60 * 24 * 30;
    const cookieStore = await cookies();

    const body = await request.json().catch(() => ({}));
    const catatan = body?.catatan || null;

    // 1. Update in custom contracts cookie if present
    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const customContracts = parseSummonedContracts(rawSummoned);
    const customIndex = customContracts.findIndex((c) => c.id === numId);

    let khodamNama = 'Khodam';
    let pengamalNama = 'Pengamal';

    if (customIndex !== -1) {
      const target = customContracts[customIndex];
      const durasi = target.durasi_hari || 5;
      const tglJatuhTempoDate = addDays(today, durasi);

      target.status = 'Aktif';
      target.is_terlambat = false;
      target.status_badge = `${durasi} hari lagi`;
      target.tgl_panggil_raw = toIsoDate(today, false);
      target.tgl_panggil = formatDateFull(today, false);
      target.tgl_jatuh_tempo_raw = toIsoDate(tglJatuhTempoDate, false);
      target.tgl_jatuh_tempo = formatDateFull(tglJatuhTempoDate, false);
      if (catatan) target.catatan_admin = catatan;

      khodamNama = target.khodam.nama;
      pengamalNama = target.pengamal;

      cookieStore.set(SUMMONED_COOKIE_NAME, encodeURIComponent(JSON.stringify(customContracts)), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: maxAge30Days,
      });
    }

    // 2. Forward to Laravel backend
    let backendMsg = '';
    try {
      const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${LARAVEL_API_URL}/admin/pemanggilan/${id}/setujui-panggil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({ catatan }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.message) backendMsg = json.message;
      }
    } catch (e) {
      console.warn('Backend setujui-panggil call skipped or failed:', e);
    }

    return NextResponse.json({
      success: true,
      message:
        backendMsg ||
        `Permintaan pemanggilan khodam ${khodamNama} untuk ${pengamalNama} berhasil disetujui. Khodam kini bersemayam.`,
      id: numId,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Setujui panggil error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyetujui pemanggilan' },
      { status: 500 }
    );
  }
}
