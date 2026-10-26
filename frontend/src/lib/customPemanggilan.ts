import { toIsoDate, formatDateFull, addDays, getStartOfToday, calculateDueDateStatus } from './dateUtils';
import { findKhodamById } from './khodamData';

export const SUMMONED_COOKIE_NAME = 'khodamku_summoned_contracts';
export const RELEASED_COOKIE_NAME = 'khodamku_released_ids';

export interface SummonedContract {
  id: number;
  kode_transaksi: string;
  pengamal: string;
  pengamal_email: string;
  khodam: {
    id: number;
    nama: string;
    kode_khodam: string;
    sigil: string;
    asal: string;
    level_kekuatan: number;
    deskripsi?: string;
  };
  tgl_panggil_raw: string;
  tgl_panggil: string;
  tgl_jatuh_tempo_raw: string;
  tgl_jatuh_tempo: string;
  tgl_pelepasan_raw: string | null;
  tgl_pelepasan: string;
  durasi_hari: number;
  status: 'Aktif' | 'Terlambat' | 'Dilepas';
  is_terlambat: boolean;
  status_badge: string;
  mahar: number;
  mahar_formatted: string;
}

/**
 * Safely parse summoned contracts from raw cookie string or JSON
 */
export function parseSummonedContracts(rawJson?: string | null): SummonedContract[] {
  if (!rawJson) return [];
  try {
    const parsed = typeof rawJson === 'string' ? JSON.parse(decodeURIComponent(rawJson)) : rawJson;
    if (Array.isArray(parsed)) {
      const today = getStartOfToday();
      return parsed.map((item) => {
        const isDilepas = item.status === 'Dilepas' || Boolean(item.tgl_pelepasan_raw);
        if (isDilepas) {
          return {
            ...item,
            status: 'Dilepas' as const,
            is_terlambat: false,
            status_badge: 'Dilepas',
            mahar: Number(item.mahar) || 0,
            mahar_formatted: `Rp${(Number(item.mahar) || 0).toLocaleString('id-ID')}`,
          };
        }

        const dueStatus = calculateDueDateStatus(item.tgl_jatuh_tempo_raw, today);
        const status = dueStatus.isTerlambat ? ('Terlambat' as const) : ('Aktif' as const);

        return {
          ...item,
          status,
          is_terlambat: dueStatus.isTerlambat,
          status_badge: dueStatus.statusText,
          mahar: dueStatus.mahar,
          mahar_formatted: dueStatus.maharFormatted,
        };
      });
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Safely parse released contract IDs from cookie
 */
export function parseReleasedIds(rawJson?: string | null): number[] {
  if (!rawJson) return [];
  try {
    const parsed = typeof rawJson === 'string' ? JSON.parse(decodeURIComponent(rawJson)) : rawJson;
    if (Array.isArray(parsed)) {
      return parsed.map((x) => Number(x)).filter((n) => !isNaN(n));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Applies release overrides and custom contracts onto baseline transactions
 */
export function applyContractOverrides(
  baselineTransactions: any[],
  customContracts: SummonedContract[] = [],
  releasedIds: number[] = []
): any[] {
  const today = getStartOfToday();
  const releasedSet = new Set(releasedIds.map((x) => Number(x)));

  // 1. Process custom contracts
  const processedCustom = customContracts.map((c) => {
    if (releasedSet.has(c.id) || c.status === 'Dilepas' || Boolean(c.tgl_pelepasan_raw)) {
      return {
        ...c,
        status: 'Dilepas' as const,
        is_terlambat: false,
        status_badge: 'Dilepas',
        tgl_pelepasan_raw: c.tgl_pelepasan_raw || toIsoDate(today, false),
        tgl_pelepasan: c.tgl_pelepasan && c.tgl_pelepasan !== '—' ? c.tgl_pelepasan : formatDateFull(today, false),
        mahar: Number(c.mahar) || 0,
        mahar_formatted: `Rp${(Number(c.mahar) || 0).toLocaleString('id-ID')}`,
      };
    }
    return c;
  });

  // 2. Process baseline transactions
  const processedBaseline = baselineTransactions.map((b) => {
    if (releasedSet.has(Number(b.id))) {
      return {
        ...b,
        status: 'Dilepas' as const,
        is_terlambat: false,
        status_badge: 'Dilepas',
        tgl_pelepasan_raw: toIsoDate(today, false),
        tgl_pelepasan: formatDateFull(today, false),
        mahar: b.mahar || 0,
        mahar_formatted: b.mahar > 0 ? `Rp${b.mahar.toLocaleString('id-ID')}` : 'Rp0',
      };
    }
    return b;
  });

  return [...processedCustom, ...processedBaseline];
}

/**
 * Creates a new summoned contract anchored to Today
 */
export function createSummonedContract(
  khodamIdOrCode: number | string,
  user: { name: string; email: string },
  durasiHari = 5,
  khodamData?: any
): SummonedContract | null {
  const khodam = khodamData || findKhodamById(khodamIdOrCode);
  if (!khodam) return null;

  const today = getStartOfToday();
  const id = 1050 + Math.floor(Math.random() * 8000);
  const sigil = khodam.kode_khodam.split('-')[1] || 'KHD';
  const tglJatuhTempoDate = addDays(today, durasiHari);

  return {
    id,
    kode_transaksi: `PMG-${id}`,
    pengamal: user.name || 'Pengamal',
    pengamal_email: user.email || '',
    khodam: {
      id: khodam.id,
      nama: khodam.nama,
      kode_khodam: khodam.kode_khodam,
      sigil,
      asal: khodam.asal,
      level_kekuatan: khodam.level_kekuatan,
      deskripsi: khodam.deskripsi,
    },
    tgl_panggil_raw: toIsoDate(today, false),
    tgl_panggil: formatDateFull(today, false),
    tgl_jatuh_tempo_raw: toIsoDate(tglJatuhTempoDate, false),
    tgl_jatuh_tempo: formatDateFull(tglJatuhTempoDate, false),
    tgl_pelepasan_raw: null,
    tgl_pelepasan: '—',
    durasi_hari: durasiHari,
    status: 'Aktif',
    is_terlambat: false,
    status_badge: `${durasiHari} hari lagi`,
    mahar: 0,
    mahar_formatted: '~Rp0',
  };
}
