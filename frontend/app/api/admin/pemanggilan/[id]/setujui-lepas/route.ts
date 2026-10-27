import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { toIsoDate, formatDateFull, getStartOfToday } from '@/lib/dateUtils';
import {
  SUMMONED_COOKIE_NAME,
  RELEASED_COOKIE_NAME,
  parseSummonedContracts,
  parseReleasedIds,
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

    // 1. Record numId in released IDs cookie
    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);
    if (!releasedIds.includes(numId)) {
      releasedIds.push(numId);
    }

    cookieStore.set(RELEASED_COOKIE_NAME, encodeURIComponent(JSON.stringify(releasedIds)), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    // 2. Update custom summoned contract if present
    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const customContracts = parseSummonedContracts(rawSummoned);
    const customIndex = customContracts.findIndex((c) => c.id === numId);

    let releasedName = 'Khodam';
    let releasedPengamal = '';

    if (customIndex !== -1) {
      const target = customContracts[customIndex];
      target.status = 'Dilepas';
      target.is_terlambat = false;
      target.status_badge = 'Dilepas';
      target.tgl_pelepasan_raw = toIsoDate(today, false);
      target.tgl_pelepasan = formatDateFull(today, false);
      if (catatan) target.catatan_admin = catatan;
      releasedName = target.khodam.nama;
      releasedPengamal = target.pengamal;

      cookieStore.set(SUMMONED_COOKIE_NAME, encodeURIComponent(JSON.stringify(customContracts)), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: maxAge30Days,
      });
    }

    // 3. Forward to Laravel backend if possible
    let backendMsg = '';
    try {
      const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${LARAVEL_API_URL}/admin/pemanggilan/${id}/setujui-lepas`, {
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
      console.warn('Backend setujui-lepas call skipped or failed:', e);
    }

    return NextResponse.json({
      success: true,
      message:
        backendMsg ||
        (releasedPengamal
          ? `Pelepasan khodam ${releasedName} dari ${releasedPengamal} berhasil disetujui. Kontrak telah selesai.`
          : `Khodam berhasil dilepaskan dari raga pengamal. Kontrak telah selesai.`),
      released_id: numId,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Setujui lepas error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyetujui pelepasan' },
      { status: 500 }
    );
  }
}
