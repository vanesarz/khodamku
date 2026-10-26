import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { MASTER_KHODAMS } from '@/lib/khodamData';
import { getAnchoredTransactions } from '@/lib/dateUtils';
import {
  SUMMONED_COOKIE_NAME,
  RELEASED_COOKIE_NAME,
  parseSummonedContracts,
  parseReleasedIds,
  applyContractOverrides,
} from '@/lib/customPemanggilan';
import { Khodam } from '@/types';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kategoriId = searchParams.get('kategori_id') || '';

    // 1. Fetch live khodam catalog from Laravel backend
    let baseKhodams: Khodam[] = MASTER_KHODAMS;
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (kategoriId) query.set('kategori_id', kategoriId);

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${LARAVEL_API_URL}/khodam?${query.toString()}`, {
        headers,
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          baseKhodams = json.data;
        }
      }
    } catch (fetchErr) {
      console.warn('Backend fetch /khodam failed, falling back to local master data:', fetchErr);
    }

    // 2. Cookie overrides for demo / interactive simulation
    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const customContracts = parseSummonedContracts(rawSummoned);

    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);

    const baseline = getAnchoredTransactions();
    const allContracts = applyContractOverrides(baseline, customContracts, releasedIds);

    const activeContracts = allContracts.filter(
      (c) => c.status === 'Aktif' || c.status === 'Terlambat'
    );

    const activeKhodamIds = new Set(activeContracts.map((c) => Number(c.khodam.id)));
    const activeKhodamCodes = new Set(
      activeContracts.map((c) => String(c.khodam.kode_khodam || '').toLowerCase())
    );
    const releasedKhodamIds = new Set(
      allContracts.filter((c) => c.status === 'Dilepas').map((c) => Number(c.khodam.id))
    );

    // 3. Dynamic availability mapping
    const dynamicKhodams = baseKhodams.map((khodam) => {
      // If simulated as occupied in active cookie contracts
      const isCookieOccupied =
        activeKhodamIds.has(Number(khodam.id)) ||
        activeKhodamCodes.has(String(khodam.kode_khodam).toLowerCase());

      // If simulated as released in cookie contracts
      const isCookieReleased = releasedKhodamIds.has(Number(khodam.id));

      let isOccupied = khodam.status === 'Sedang Bersemayam' || !khodam.is_tersedia;

      if (isCookieOccupied) {
        isOccupied = true;
      } else if (isCookieReleased && !isCookieOccupied) {
        isOccupied = false;
      }

      return {
        ...khodam,
        status: isOccupied ? ('Sedang Bersemayam' as const) : ('Menunggu Dipanggil' as const),
        is_tersedia: !isOccupied,
      };
    });

    return NextResponse.json({
      success: true,
      data: dynamicKhodams,
      summary: {
        total: dynamicKhodams.length,
        tersedia: dynamicKhodams.filter((k) => k.is_tersedia).length,
        bersemayam: dynamicKhodams.filter((k) => !k.is_tersedia).length,
      },
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Error fetching dynamic khodams:', error);
    return NextResponse.json(
      { error: 'Gagal memuat status ketersediaan khodam' },
      { status: 500 }
    );
  }
}
