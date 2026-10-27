import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { getAnchoredTransactions } from '@/lib/dateUtils';
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

    // 1. Fetch real active and pending contracts directly from Laravel backend
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
      const filteredBackend = backendData.filter((item) => !releasedIds.includes(item.id));
      const unreleasedCustom = customContracts.filter((c) => !releasedIds.includes(c.id));

      let customMatchesTab: any[] = [];
      if (tab === 'permintaan_panggil') {
        customMatchesTab = unreleasedCustom.filter((c) => c.status === 'Menunggu Persetujuan');
      } else if (tab === 'permintaan_lepas') {
        customMatchesTab = unreleasedCustom.filter((c) => c.status === 'Menunggu Pelepasan');
      } else if (tab === 'terlambat') {
        customMatchesTab = unreleasedCustom.filter((c) => c.status === 'Terlambat');
      } else if (tab === 'masih_berjalan') {
        customMatchesTab = unreleasedCustom.filter((c) => c.status === 'Aktif' && !c.is_terlambat);
      } else {
        // 'semua'
        customMatchesTab = unreleasedCustom.filter(
          (c) => c.status === 'Aktif' || c.status === 'Terlambat' || c.status === 'Menunggu Pelepasan'
        );
      }

      const combined = [...filteredBackend, ...customMatchesTab];

      const countPanggil =
        (backendTabs?.permintaan_panggil || 0) +
        unreleasedCustom.filter((c) => c.status === 'Menunggu Persetujuan').length;
      const countLepas =
        (backendTabs?.permintaan_lepas || 0) +
        unreleasedCustom.filter((c) => c.status === 'Menunggu Pelepasan').length;
      const countTerlambat =
        (backendTabs?.terlambat || 0) + unreleasedCustom.filter((c) => c.status === 'Terlambat').length;
      const countMasihBerjalan =
        (backendTabs?.masih_berjalan || 0) +
        unreleasedCustom.filter((c) => c.status === 'Aktif' && !c.is_terlambat).length;
      const countSemua =
        (backendTabs?.semua || 0) +
        unreleasedCustom.filter(
          (c) => c.status === 'Aktif' || c.status === 'Terlambat' || c.status === 'Menunggu Pelepasan'
        ).length;

      return NextResponse.json({
        message: 'Daftar pemanggilan aktif berhasil dimuat',
        tabs: {
          semua: countSemua,
          terlambat: countTerlambat,
          masih_berjalan: countMasihBerjalan,
          permintaan_panggil: countPanggil,
          permintaan_lepas: countLepas,
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
          status: item.status || (item.is_terlambat ? 'Terlambat' : 'Aktif'),
          tgl_panggil: item.tgl_panggil,
          tgl_jatuh_tempo: item.tgl_jatuh_tempo,
          tgl_jatuh_tempo_raw: item.tgl_jatuh_tempo_raw || item.tgl_jatuh_tempo || '',
          status_badge: item.status_badge,
          catatan_admin: item.catatan_admin || null,
          estimasi_mahar:
            typeof item.estimasi_mahar === 'number'
              ? `Rp${item.estimasi_mahar.toLocaleString('id-ID')}`
              : item.estimasi_mahar
                ? String(item.estimasi_mahar).replace('~', '')
                : 'Rp0',
          mahar: typeof item.estimasi_mahar === 'number' ? item.estimasi_mahar : Number(item.mahar) || 0,
          is_terlambat: Boolean(item.is_terlambat),
        })),
      });
    }

    // Local fallback if backend is unreachable
    const all = getAnchoredTransactions();
    const combinedAll = applyContractOverrides(all, customContracts, releasedIds);

    const countPanggil = combinedAll.filter((i) => i.status === 'Menunggu Persetujuan').length;
    const countLepas = combinedAll.filter((i) => i.status === 'Menunggu Pelepasan').length;
    const countTerlambat = combinedAll.filter((i) => i.status === 'Terlambat').length;
    const countMasihBerjalan = combinedAll.filter((i) => i.status === 'Aktif' && !i.is_terlambat).length;
    const countSemua = combinedAll.filter(
      (i) => i.status === 'Aktif' || i.status === 'Terlambat' || i.status === 'Menunggu Pelepasan'
    ).length;

    let filtered: any[] = [];
    if (tab === 'permintaan_panggil') {
      filtered = combinedAll.filter((i) => i.status === 'Menunggu Persetujuan');
    } else if (tab === 'permintaan_lepas') {
      filtered = combinedAll.filter((i) => i.status === 'Menunggu Pelepasan');
    } else if (tab === 'terlambat') {
      filtered = combinedAll.filter((i) => i.status === 'Terlambat');
    } else if (tab === 'masih_berjalan') {
      filtered = combinedAll.filter((i) => i.status === 'Aktif' && !i.is_terlambat);
    } else {
      filtered = combinedAll.filter(
        (i) => i.status === 'Aktif' || i.status === 'Terlambat' || i.status === 'Menunggu Pelepasan'
      );
    }

    return NextResponse.json({
      message: 'Daftar pemanggilan aktif berhasil dimuat',
      tabs: {
        semua: countSemua,
        terlambat: countTerlambat,
        masih_berjalan: countMasihBerjalan,
        permintaan_panggil: countPanggil,
        permintaan_lepas: countLepas,
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
        status: item.status,
        tgl_panggil: item.tgl_panggil,
        tgl_jatuh_tempo: item.tgl_jatuh_tempo,
        tgl_jatuh_tempo_raw: item.tgl_jatuh_tempo_raw || '',
        status_badge: item.status_badge,
        catatan_admin: item.catatan_admin || null,
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
