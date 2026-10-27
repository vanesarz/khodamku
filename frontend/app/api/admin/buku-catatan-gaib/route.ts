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
    const status = searchParams.get('status') || 'semua';
    const pengamal = searchParams.get('pengamal');
    const dariTanggal = searchParams.get('dari_tanggal');
    const sampaiTanggal = searchParams.get('sampai_tanggal');

    // 1. Fetch real ledger directly from Laravel backend
    let backendData: any[] = [];
    let backendRingkasan: any = null;
    let backendFilterOptions: any = null;

    try {
      const queryParams = new URLSearchParams();
      if (status && status !== 'semua') queryParams.set('status', status);
      if (dariTanggal) queryParams.set('dari_tanggal', dariTanggal);
      if (sampaiTanggal) queryParams.set('sampai_tanggal', sampaiTanggal);

      const res = await fetch(`${LARAVEL_API_URL}/admin/buku-catatan-gaib?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        backendData = json.data || [];
        backendRingkasan = json.ringkasan;
        backendFilterOptions = json.filter_options;
      }
    } catch (e) {
      console.warn('Backend buku catatan gaib fetch failed, using fallback:', e);
    }

    // 2. Read released contract IDs and custom summoned contracts from cookie
    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);

    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const customContracts = parseSummonedContracts(rawSummoned);

    // If backend data succeeded:
    if (backendData.length > 0 || backendRingkasan) {
      // Apply release overrides if any was released only locally
      let list = backendData.map((item) => {
        const rawPanggil = item.raw_tgl_panggil || item.tgl_panggil_raw || item.tgl_panggil;
        const baseItem = {
          ...item,
          raw_tgl_panggil: rawPanggil,
          tgl_panggil_raw: rawPanggil,
        };
        if (releasedIds.includes(item.id) && item.status !== 'Dilepas') {
          return {
            ...baseItem,
            status: 'Dilepas',
            tgl_pelepasan_formatted: item.tgl_pelepasan_formatted !== '—' ? item.tgl_pelepasan_formatted : 'Hari ini',
          };
        }
        return baseItem;
      });

      // Append custom contracts
      const formattedCustom = customContracts.map((c) => {
        const isRel = releasedIds.includes(c.id) || c.status === 'Dilepas';
        const rawPanggil = c.tgl_panggil_raw || c.tgl_panggil;
        return {
          id: c.id,
          kode_transaksi: c.kode_transaksi,
          pengamal: c.pengamal,
          khodam: {
            nama: c.khodam.nama,
            kode_khodam: c.khodam.kode_khodam,
          },
          tgl_panggil: c.tgl_panggil_raw || c.tgl_panggil,
          tgl_panggil_formatted: c.tgl_panggil,
          raw_tgl_panggil: rawPanggil,
          tgl_panggil_raw: rawPanggil,
          tgl_jatuh_tempo: c.tgl_jatuh_tempo_raw || c.tgl_jatuh_tempo,
          tgl_jatuh_tempo_formatted: c.tgl_jatuh_tempo,
          tgl_pelepasan: isRel ? (c.tgl_pelepasan_raw || 'Hari ini') : null,
          tgl_pelepasan_formatted: isRel ? (c.tgl_pelepasan || 'Hari ini') : '—',
          mahar: c.mahar,
          mahar_formatted: c.mahar_formatted,
          status: isRel ? 'Dilepas' : (c.status === 'Terlambat' ? 'Terlambat' : 'Aktif'),
        };
      });

      list = [...formattedCustom, ...list];

      // Filters
      if (pengamal && pengamal !== 'all') {
        list = list.filter((i) => i.pengamal === pengamal);
      }
      if (status !== 'semua') {
        list = list.filter((i) => i.status.toLowerCase() === status.toLowerCase());
      }
      if (dariTanggal) {
        list = list.filter((i) => (i.raw_tgl_panggil || i.tgl_panggil || '') >= dariTanggal);
      }
      if (sampaiTanggal) {
        list = list.filter((i) => (i.raw_tgl_panggil || i.tgl_panggil || '') <= sampaiTanggal);
      }

      const totalMahar = list.reduce((sum, item) => sum + (Number(item.mahar) || 0), 0);

      return NextResponse.json({
        message: 'Data Buku Catatan Gaib berhasil dimuat',
        ringkasan: {
          total_transaksi: list.length,
          total_mahar: totalMahar,
          total_mahar_formatted: `Rp${totalMahar.toLocaleString('id-ID')}`,
        },
        filter_options: backendFilterOptions,
        data: list,
      });
    }

    // Local fallback
    const all = getAnchoredTransactions();
    let list = applyContractOverrides(all, customContracts, releasedIds);

    if (pengamal && pengamal !== 'all') {
      list = list.filter((i) => i.pengamal === pengamal);
    }
    if (status !== 'semua') {
      list = list.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }
    if (dariTanggal) {
      list = list.filter((i) => i.tgl_panggil_raw >= dariTanggal);
    }
    if (sampaiTanggal) {
      list = list.filter((i) => i.tgl_panggil_raw <= sampaiTanggal);
    }

    const totalMahar = list.reduce((sum, item) => sum + (Number(item.mahar) || 0), 0);

    return NextResponse.json({
      message: 'Data Buku Catatan Gaib berhasil dimuat',
      ringkasan: {
        total_transaksi: list.length,
        total_mahar: totalMahar,
        total_mahar_formatted: `Rp${totalMahar.toLocaleString('id-ID')}`,
      },
      data: list.map((item) => ({
        id: item.id,
        kode_transaksi: item.kode_transaksi,
        pengamal: item.pengamal,
        khodam: {
          nama: item.khodam?.nama || 'Khodam Pendamping',
          kode_khodam: item.khodam?.kode_khodam || 'KHD-001',
        },
        tgl_panggil: item.tgl_panggil,
        raw_tgl_panggil: item.tgl_panggil_raw,
        tgl_jatuh_tempo: item.tgl_jatuh_tempo,
        tgl_pelepasan: item.tgl_pelepasan,
        mahar: item.mahar,
        mahar_formatted: item.mahar_formatted,
        status: item.status,
      })),
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Buku Catatan Gaib fetch error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat Buku Catatan Gaib' },
      { status: 500 }
    );
  }
}
