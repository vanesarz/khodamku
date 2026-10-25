import { NextRequest, NextResponse } from 'next/server';
import { MASTER_KHODAMS } from '@/lib/khodamData';
import { getAnchoredTransactions } from '@/lib/dateUtils';
import {
  SUMMONED_COOKIE_NAME,
  RELEASED_COOKIE_NAME,
  parseSummonedContracts,
  parseReleasedIds,
  applyContractOverrides,
} from '@/lib/customPemanggilan';

export async function GET(request: NextRequest) {
  try {
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

    const dynamicKhodams = MASTER_KHODAMS.map((khodam) => {
      const isOccupied =
        activeKhodamIds.has(Number(khodam.id)) ||
        activeKhodamCodes.has(String(khodam.kode_khodam).toLowerCase());

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
