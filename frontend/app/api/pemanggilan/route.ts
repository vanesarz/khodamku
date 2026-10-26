import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/auth';
import { getAnchoredTransactions, anchorTransaction } from '@/lib/dateUtils';
import {
  SUMMONED_COOKIE_NAME,
  RELEASED_COOKIE_NAME,
  parseSummonedContracts,
  parseReleasedIds,
  applyContractOverrides,
  createSummonedContract,
} from '@/lib/customPemanggilan';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const userCookie = request.cookies.get(USER_COOKIE_NAME)?.value;
    let userEmail = '';

    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        userEmail = parsed.email || '';
      } catch {
        // ignore parse error
      }
    }

    // 1. Get baseline transactions for this user
    const allBaseline = getAnchoredTransactions();
    const emailLower = userEmail.toLowerCase().trim();
    let userBaseline: any[] = [];

    if (emailLower.includes('sekar')) {
      userBaseline = allBaseline.filter((t) => t.pengamal_email.toLowerCase().includes('sekar'));
    } else if (emailLower.includes('bima')) {
      userBaseline = allBaseline.filter((t) => t.pengamal_email.toLowerCase().includes('bima'));
    } else if (emailLower.includes('raka') || emailLower.includes('pengamal@khodamku.test')) {
      userBaseline = allBaseline.filter((t) => t.pengamal_email.toLowerCase().includes('raka'));
    } else {
      userBaseline = [];
    }

    // 2. Read custom summoned contracts and released IDs from cookie
    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const allCustom = parseSummonedContracts(rawSummoned);
    const userCustom = allCustom.filter(
      (c) => c.pengamal_email.toLowerCase().trim() === emailLower
    );

    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);

    // 3. Apply overrides (marks released contracts as Dilepas)
    const combined = applyContractOverrides(userBaseline, userCustom, releasedIds);

    return NextResponse.json({
      success: true,
      data: combined.map((item) => anchorTransaction(item)),
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Pemanggilan saya fetch error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data pemanggilan pengguna' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Harap masuk ke akunmu terlebih dahulu' }, { status: 401 });
    }

    const userCookie = request.cookies.get(USER_COOKIE_NAME)?.value;
    let user = { name: 'Pengamal', email: '' };

    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        if (parsed.email) user.email = parsed.email;
        if (parsed.name) user.name = parsed.name;
      } catch {
        // ignore
      }
    }

    const body = await request.json();
    const { khodam_id, durasi_hari = 5, khodam_data } = body;

    if (!khodam_id) {
      return NextResponse.json(
        { error: 'Entitas khodam yang hendak dipanggil wajib dipilih' },
        { status: 422 }
      );
    }

    // 1. Read existing custom contracts and released IDs
    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const existingCustom = parseSummonedContracts(rawSummoned);

    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);

    // 2. Count current active contracts for this user after applying releases
    const allBaseline = getAnchoredTransactions();
    const emailLower = user.email.toLowerCase().trim();
    let userBaseline: any[] = [];

    if (emailLower.includes('sekar')) {
      userBaseline = allBaseline.filter((t) => t.pengamal_email.toLowerCase().includes('sekar'));
    } else if (emailLower.includes('bima')) {
      userBaseline = allBaseline.filter((t) => t.pengamal_email.toLowerCase().includes('bima'));
    } else if (emailLower.includes('raka') || emailLower.includes('pengamal@khodamku.test')) {
      userBaseline = allBaseline.filter((t) => t.pengamal_email.toLowerCase().includes('raka'));
    } else {
      userBaseline = [];
    }

    const userCustom = existingCustom.filter(
      (c) => c.pengamal_email.toLowerCase().trim() === emailLower
    );

    const effectiveUserContracts = applyContractOverrides(userBaseline, userCustom, releasedIds);
    const activeContracts = effectiveUserContracts.filter(
      (t) => t.status === 'Aktif' || t.status === 'Terlambat'
    );

    if (activeContracts.length >= 2) {
      return NextResponse.json(
        {
          error:
            'Batas raga penuh! Ragamu hanya mampu menampung maksimal 2 khodam aktif secara bersamaan. Hubungi Juru Kunci untuk melepaskan salah satu khodam terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    // 3. Check if this khodam is currently active across the entire system
    const allEffectiveContracts = applyContractOverrides(allBaseline, existingCustom, releasedIds);
    const allActive = allEffectiveContracts.filter(
      (t) => t.status === 'Aktif' || t.status === 'Terlambat'
    );

    const isAlreadyActive = allActive.some(
      (t) =>
        t.khodam.id === Number(khodam_id) ||
        t.khodam.kode_khodam.toLowerCase() === String(khodam_id).toLowerCase()
    );

    if (isAlreadyActive) {
      return NextResponse.json(
        {
          error: 'Khodam ini sedang bersemayam di raga pengamal lain dan belum dilepaskan.',
        },
        { status: 400 }
      );
    }

    // 4. Create new summoned contract
    const newContract = createSummonedContract(khodam_id, user, Number(durasi_hari) || 5, khodam_data);
    if (!newContract) {
      return NextResponse.json({ error: 'Khodam tidak ditemukan dalam katalog' }, { status: 404 });
    }

    // 5. Append and persist in 30-day cookie
    const updatedCustom = [newContract, ...existingCustom];
    const cookieStore = await cookies();
    const maxAge30Days = 60 * 60 * 24 * 30;

    cookieStore.set(SUMMONED_COOKIE_NAME, encodeURIComponent(JSON.stringify(updatedCustom)), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge30Days,
    });

    return NextResponse.json({
      success: true,
      message: `Ritual berhasil disempurnakan! Khodam ${newContract.khodam.nama} kini bersemayam di ragamu.`,
      data: newContract,
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Pemanggilan ritual error:', error);
    return NextResponse.json(
      { error: 'Terjadi gangguan gaib saat memproses pemanggilan' },
      { status: 500 }
    );
  }
}
