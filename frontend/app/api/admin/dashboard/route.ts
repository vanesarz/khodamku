import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { getAnchoredTransactions, formatDateFull } from '@/lib/dateUtils';
import { MASTER_KHODAMS } from '@/lib/khodamData';
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

    // 1. Read release overrides & custom summoned contracts from cookie
    const rawReleased = request.cookies.get(RELEASED_COOKIE_NAME)?.value;
    const releasedIds = parseReleasedIds(rawReleased);

    const rawSummoned = request.cookies.get(SUMMONED_COOKIE_NAME)?.value;
    const customContracts = parseSummonedContracts(rawSummoned);

    // 2. Fetch directly from Laravel backend
    try {
      const res = await fetch(`${LARAVEL_API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;

        if (data) {
          // Exclude any released contract from jatuh_tempo_terdekat
          let jatuhTempo = (data.jatuh_tempo_terdekat || []).filter(
            (item: any) => !releasedIds.includes(item.id)
          );

          // If there are custom summoned contracts, integrate them
          const activeCustom = customContracts
            .filter((c) => !releasedIds.includes(c.id))
            .filter((c) => c.status === 'Aktif' || c.status === 'Terlambat');

          if (activeCustom.length > 0) {
            const customJatuhTempo = activeCustom.map((c) => ({
              id: c.id,
              khodam: {
                nama: c.khodam.nama,
                kode_khodam: c.khodam.kode_khodam,
                sigil: c.khodam.sigil,
              },
              pengamal: c.pengamal,
              tgl_jatuh_tempo: c.tgl_jatuh_tempo_raw || c.tgl_jatuh_tempo,
              status_badge: c.status_badge,
              is_terlambat: c.is_terlambat,
            }));
            jatuhTempo = [...jatuhTempo, ...customJatuhTempo].slice(0, 6);
          }

          // Adjust stats if releasedIds or activeCustom exist
          const terlambatCount = jatuhTempo.filter((i: any) => i.is_terlambat).length;
          const aktifCount = (data.statistik?.pemanggilan_aktif || 0) - releasedIds.length + activeCustom.length;

          return NextResponse.json({
            message: 'Data dashboard berhasil dimuat dari backend',
            data: {
              ...data,
              ringkasan: {
                terlambat: Math.max(0, terlambatCount),
                estimasi_mahar_terlambat: data.ringkasan?.estimasi_mahar_terlambat || 0,
              },
              statistik: {
                ...data.statistik,
                pemanggilan_aktif: Math.max(0, aktifCount),
                sedang_bersemayam: Math.max(0, aktifCount),
                terlambat: Math.max(0, terlambatCount),
                menunggu_dipanggil: Math.max(0, (data.statistik?.jumlah_unit || 8) - Math.max(0, aktifCount)),
              },
              jatuh_tempo_terdekat: jatuhTempo,
            },
          });
        }
      }
    } catch (e) {
      console.warn('Backend admin dashboard fetch failed, using fallback:', e);
    }

    // 3. Fallback if backend is unreachable
    const baseline = getAnchoredTransactions();
    const all = applyContractOverrides(baseline, customContracts, releasedIds);
    const activeOnly = all.filter((item) => item.status === 'Aktif' || item.status === 'Terlambat');
    const terlambatItems = activeOnly.filter((item) => item.is_terlambat);

    const totalUnit = MASTER_KHODAMS.length;
    const pemanggilanAktif = activeOnly.length;
    const sedangBersemayam = pemanggilanAktif;
    const menungguDipanggil = Math.max(0, totalUnit - sedangBersemayam);

    const jatuhTempo = [...activeOnly]
      .sort((a, b) => {
        if (a.is_terlambat && !b.is_terlambat) return -1;
        if (!a.is_terlambat && b.is_terlambat) return 1;
        return (a.tgl_jatuh_tempo_raw || '').localeCompare(b.tgl_jatuh_tempo_raw || '');
      })
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        khodam: {
          nama: item.khodam.nama,
          kode_khodam: item.khodam.kode_khodam,
          sigil: item.khodam.sigil,
        },
        pengamal: item.pengamal,
        tgl_jatuh_tempo: item.tgl_jatuh_tempo_raw || item.tgl_jatuh_tempo,
        status_badge: item.status_badge,
        is_terlambat: item.is_terlambat,
      }));

    const kategoriMap: Record<string, number> = {};
    MASTER_KHODAMS.forEach((k) => {
      (k.kategoris || []).forEach((cat: { id: number; nama: string }) => {
        const catName = cat.nama;
        kategoriMap[catName] = (kategoriMap[catName] || 0) + 1;
      });
    });

    const kategori = Object.entries(kategoriMap).map(([nama, jumlah_khodam], id) => ({
      id: id + 1,
      nama,
      jumlah_khodam,
    }));

    return NextResponse.json({
      message: 'Data dashboard fallback dimuat',
      data: {
        tanggal: new Date().toISOString().split('T')[0],
        ringkasan: {
          terlambat: terlambatItems.length,
          estimasi_mahar_terlambat: terlambatItems.reduce((acc, curr) => acc + (curr.mahar || 0), 0),
        },
        statistik: {
          jumlah_unit: totalUnit,
          menunggu_dipanggil: menungguDipanggil,
          sedang_bersemayam: sedangBersemayam,
          pemanggilan_aktif: pemanggilanAktif,
          terlambat: terlambatItems.length,
        },
        jatuh_tempo_terdekat: jatuhTempo,
        kategori,
        pengamal_terdaftar: 3,
        mahar_terkumpul: 20000,
      },
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Dashboard API route error:', error);
    return NextResponse.json({ error: 'Gagal memuat data dashboard' }, { status: 500 });
  }
}
