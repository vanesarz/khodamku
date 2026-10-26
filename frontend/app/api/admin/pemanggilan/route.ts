import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { getAnchoredTransactions, anchorTransaction } from '@/lib/dateUtils';
import {
  SUMMONED_COOKIE_NAME,
  RELEASED_COOKIE_NAME,
  parseSummonedContracts,
  parseReleasedIds,
  applyContractOverrides,
} from '@/lib/customPemanggilan';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'semua';

    // 1. Fetch real active contracts directly from Laravel backend
    let backendData: any[] = [];
    let backendTabs: any = null;

    try {
      const res = await fetch(`${LARAVEL_API_URL}/admin/pemanggilan/aktif?tab=${tab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        backendData = json.data || [];
        backendTabs = json.tabs;
      }
    } catch (e) {
      console.warn('Backend pemanggilan aktif fetch failed, using fallback:', e);
    }

    // 2. Read released contract IDs and custom summoned contracts from cookie
    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);

    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const customContracts = parseSummonedContracts(rawSummoned);

    // If backend data succeeded:
    if (backendData.length > 0 || backendTabs) {
      // Data backend adalah sumber kebenaran, tidak disaring cookie
      const filteredBackend = backendData;
      const activeCustom = customContracts
        .filter((c) => !releasedIds.includes(c.id))
        .filter((c) => c.status === 'Aktif' || c.status === 'Terlambat');

      let combined = [...filteredBackend, ...activeCustom];
      if (tab === 'terlambat') {
        combined = combined.filter((i) => i.is_terlambat);
      } else if (tab === 'masih_berjalan') {
        combined = combined.filter((i) => !i.is_terlambat);
      }

      const allActiveUnfiltered = [
        ...backendData,
        ...activeCustom,
      ];

      return NextResponse.json({
        message: 'Daftar pemanggilan aktif berhasil dimuat',
        tabs: {
          semua: allActiveUnfiltered.length,
          terlambat: allActiveUnfiltered.filter((i) => i.is_terlambat).length,
          masih_berjalan: allActiveUnfiltered.filter((i) => !i.is_terlambat).length,
        },
        data: combined.map((item) => ({
          id: item.id,
          kode_transaksi: item.kode_transaksi || `PMG-${item.id}`,
          pengamal: item.pengamal,
          khodam: {
            nama: item.khodam?.nama || 'Khodam Pendamping',
            kode_khodam: item.khodam?.kode_khodam || 'KHD-001',
            sigil: item.khodam?.sigil || item.khodam?.kode_khodam?.split('-')[1] || 'KHD',
          },
          tgl_panggil: item.tgl_panggil,
          tgl_jatuh_tempo: item.tgl_jatuh_tempo,
          tgl_jatuh_tempo_raw: item.tgl_jatuh_tempo_raw || item.tgl_jatuh_tempo || '',
          status_badge: item.status_badge,
          estimasi_mahar: typeof item.estimasi_mahar === 'number'
            ? `Rp${item.estimasi_mahar.toLocaleString('id-ID')}`
            : (item.estimasi_mahar ? String(item.estimasi_mahar).replace('~', '') : 'Rp0'),
          mahar: typeof item.estimasi_mahar === 'number' ? item.estimasi_mahar : Number(item.mahar) || 0,
          is_terlambat: Boolean(item.is_terlambat),
        })),
      });
    }

    // Local fallback if backend is unreachable
    const all = getAnchoredTransactions();
    const combinedAll = applyContractOverrides(all, customContracts, releasedIds);
    const activeOnly = combinedAll.filter((item) => item.status === 'Aktif' || item.status === 'Terlambat');

    let filtered = activeOnly;
    if (tab === 'terlambat') {
      filtered = activeOnly.filter((i) => i.is_terlambat);
    } else if (tab === 'masih_berjalan') {
      filtered = activeOnly.filter((i) => !i.is_terlambat);
    }

    return NextResponse.json({
      message: 'Daftar pemanggilan aktif berhasil dimuat',
      tabs: {
        semua: activeOnly.length,
        terlambat: activeOnly.filter((i) => i.is_terlambat).length,
        masih_berjalan: activeOnly.filter((i) => !i.is_terlambat).length,
      },
      data: filtered.map((item) => ({
        id: item.id,
        kode_transaksi: item.kode_transaksi,
        pengamal: item.pengamal,
        khodam: {
          nama: item.khodam?.nama || 'Khodam Pendamping',
          kode_khodam: item.khodam?.kode_khodam || 'KHD-001',
          sigil: item.khodam?.sigil || 'KHD',
        },
        tgl_panggil: item.tgl_panggil,
        tgl_jatuh_tempo: item.tgl_jatuh_tempo,
        tgl_jatuh_tempo_raw: item.tgl_jatuh_tempo_raw || '',
        status_badge: item.status_badge,
        estimasi_mahar: item.mahar_formatted ? item.mahar_formatted.replace('~', '') : 'Rp0',
        mahar: Number(item.mahar) || 0,
        is_terlambat: item.is_terlambat,
      })),
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Pemanggilan fetch error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat pemanggilan aktif' },
      { status: 500 }
    );
  }
}
