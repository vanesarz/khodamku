// Dynamic Indonesian Date Utilities anchored to real "Today"

const INDO_MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const INDO_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
];

const INDO_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

const INDO_MONTHS_MAP: Record<string, number> = {
  januari: 0, jan: 0, january: 0,
  februari: 1, feb: 1, february: 1,
  maret: 2, mar: 2, march: 2,
  april: 3, apr: 3,
  mei: 4, may: 4,
  juni: 5, jun: 5, june: 5,
  juli: 6, jul: 6, july: 6,
  agustus: 7, ags: 7, aug: 7, august: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9, oct: 9, october: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, dec: 11, december: 11,
};

/**
 * Returns a Date object representing the start of today (00:00:00.000)
 */
export function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Parses any date format (Date instance, ISO YYYY-MM-DD, or Indonesian "DD Month YYYY")
 */
export function parseAnyDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const str = String(input).trim();
  if (!str || str === '—' || str === '-') return null;

  // 1. ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const parsed = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // 2. Indonesian formatted string: "25 Oktober 2026" or "5 Mei 2025" or "10 Apr 2025"
  const indoMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (indoMatch) {
    const [, d, monthStr, y] = indoMatch;
    const m = INDO_MONTHS_MAP[monthStr.toLowerCase()];
    if (m !== undefined) {
      const parsed = new Date(parseInt(y, 10), m, parseInt(d, 10));
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  // 3. Native fallback
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Anchors legacy seed dates (May 2025) relative to real "Today",
 * while preserving actual modern dates.
 */
export function anchorDateToToday(input: string | Date | null | undefined, customToday?: Date): Date | null {
  const d = parseAnyDate(input);
  if (!d) return null;
  const today = customToday || getStartOfToday();

  // If year is 2025 (original backend mockup base), map relative to 14 Mei 2025
  if (d.getFullYear() === 2025) {
    const ref2025 = new Date(2025, 4, 14); // 14 Mei 2025
    const diffTime = d.getTime() - ref2025.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return addDays(today, diffDays);
  }

  return d;
}

/**
 * Returns formatted header date for today: e.g. "Minggu, 25 Oktober 2026"
 */
export function formatHeaderToday(date?: Date): string {
  const d = date || new Date();
  const dayName = INDO_DAYS[d.getDay()] || '';
  const dayNum = d.getDate();
  const monthName = INDO_MONTHS_FULL[d.getMonth()] || '';
  const year = d.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Formats a Date object or ISO string to ISO YYYY-MM-DD
 */
export function toIsoDate(dateInput: string | Date | null | undefined, anchorToToday = true): string {
  if (!dateInput) return '';
  const d = anchorToToday ? anchorDateToToday(dateInput) : parseAnyDate(dateInput);
  if (!d || isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds or subtracts days from a base date
 */
export function addDays(baseDate: Date, days: number): Date {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formats date string into Indonesian full format: e.g. "25 Oktober 2026"
 */
export function formatDateFull(dateInput: string | Date | null | undefined, anchorToToday = true): string {
  if (!dateInput) return '—';
  try {
    const d = anchorToToday ? anchorDateToToday(dateInput) : parseAnyDate(dateInput);
    if (!d || isNaN(d.getTime())) return String(dateInput);
    return `${d.getDate()} ${INDO_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats date string into Indonesian short format: e.g. "25 Okt 2026"
 */
export function formatDateShort(dateInput: string | Date | null | undefined, anchorToToday = true): string {
  if (!dateInput) return '—';
  try {
    const d = anchorToToday ? anchorDateToToday(dateInput) : parseAnyDate(dateInput);
    if (!d || isNaN(d.getTime())) return String(dateInput);
    return `${d.getDate()} ${INDO_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Calculates relative days and status from today
 */
export function calculateDueDateStatus(dueDateInput: string | Date | null | undefined, customToday?: Date) {
  const today = customToday || getStartOfToday();
  const due = anchorDateToToday(dueDateInput, today);

  if (!due) {
    return {
      statusText: '2 hari lagi',
      diffDays: -2,
      mahar: 0,
      maharFormatted: 'Rp0',
      isTerlambat: false,
      isHariIni: false,
    };
  }

  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffTime = today.getTime() - dueStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      statusText: `Telat ${diffDays} hari`,
      diffDays,
      mahar: diffDays * 5000,
      maharFormatted: `~Rp${(diffDays * 5000).toLocaleString('id-ID')}`,
      isTerlambat: true,
      isHariIni: false,
    };
  } else if (diffDays === 0) {
    return {
      statusText: 'Hari ini',
      diffDays: 0,
      mahar: 0,
      maharFormatted: 'Rp0',
      isTerlambat: false,
      isHariIni: true,
    };
  } else {
    const remaining = Math.abs(diffDays);
    return {
      statusText: `${remaining} hari lagi`,
      diffDays,
      mahar: 0,
      maharFormatted: 'Rp0',
      isTerlambat: false,
      isHariIni: false,
    };
  }
}

/**
 * Transforms any transaction object (from backend API or local mock)
 * into a dynamic transaction anchored to real "Today".
 */
export function anchorTransaction(rawTx: any, todayDate?: Date) {
  const today = todayDate || getStartOfToday();
  const tglPanggilDate = anchorDateToToday(rawTx.tgl_panggil, today) || addDays(today, -3);
  const tglJatuhTempoDate = anchorDateToToday(rawTx.tgl_jatuh_tempo, today) || addDays(tglPanggilDate, 5);
  const tglPelepasanDate = rawTx.tgl_pelepasan ? anchorDateToToday(rawTx.tgl_pelepasan, today) : null;

  const dueStatus = calculateDueDateStatus(tglJatuhTempoDate, today);
  const isDilepas =
    String(rawTx.status || '').toLowerCase() === 'dilepas' ||
    Boolean(rawTx.tgl_pelepasan_raw) ||
    Boolean(tglPelepasanDate);

  const status: 'Aktif' | 'Terlambat' | 'Dilepas' = isDilepas
    ? 'Dilepas'
    : dueStatus.isTerlambat
      ? 'Terlambat'
      : 'Aktif';

  const mahar = isDilepas
    ? Number(rawTx.mahar) || 0
    : dueStatus.mahar;

  return {
    ...rawTx,
    tgl_panggil_raw: toIsoDate(tglPanggilDate, false),
    tgl_panggil: formatDateFull(tglPanggilDate, false),
    tgl_jatuh_tempo_raw: toIsoDate(tglJatuhTempoDate, false),
    tgl_jatuh_tempo: formatDateFull(tglJatuhTempoDate, false),
    tgl_pelepasan_raw: tglPelepasanDate ? toIsoDate(tglPelepasanDate, false) : (rawTx.tgl_pelepasan_raw || (isDilepas ? toIsoDate(today, false) : null)),
    tgl_pelepasan: tglPelepasanDate ? formatDateFull(tglPelepasanDate, false) : (rawTx.tgl_pelepasan && rawTx.tgl_pelepasan !== '—' ? rawTx.tgl_pelepasan : (isDilepas ? formatDateFull(today, false) : '—')),
    status,
    is_terlambat: status === 'Terlambat',
    status_badge: isDilepas ? 'Dilepas' : dueStatus.statusText,
    mahar,
    mahar_formatted: mahar > 0 ? (isDilepas ? `Rp${mahar.toLocaleString('id-ID')}` : `~Rp${mahar.toLocaleString('id-ID')}`) : (isDilepas ? 'Rp0' : '~Rp0'),
  };
}

/**
 * Generates canonical transactions anchored directly to Today
 */
export function getAnchoredTransactions(todayDate?: Date) {
  const today = todayDate || getStartOfToday();

  return [
    // 1. Naga Hijau - Raka Pratama (Aktif, 2 hari lagi)
    {
      id: 1042,
      kode_transaksi: 'PMG-1042',
      pengamal: 'Raka Pratama',
      pengamal_email: 'raka@khodamku.test',
      khodam: {
        id: 5,
        nama: 'Naga Hijau',
        kode_khodam: 'KHD-NGH-001',
        sigil: 'NGH',
        asal: 'Telaga Sarangan, Magetan',
        level_kekuatan: 5,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -3), false),
      tgl_panggil: formatDateFull(addDays(today, -3), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, 2), false),
      tgl_jatuh_tempo: formatDateFull(addDays(today, 2), false),
      tgl_pelepasan_raw: null,
      tgl_pelepasan: '—',
      mahar: 0,
      mahar_formatted: '~Rp0',
      status: 'Aktif' as const,
      is_terlambat: false,
      status_badge: '2 hari lagi',
    },
    // 2. Kucing Oren Barbar - Bima Saputra (Aktif, 3 hari lagi)
    {
      id: 1041,
      kode_transaksi: 'PMG-1041',
      pengamal: 'Bima Saputra',
      pengamal_email: 'bima@khodamku.test',
      khodam: {
        id: 6,
        nama: 'Kucing Oren Barbar',
        kode_khodam: 'KHD-KCO-001',
        sigil: 'KCO',
        asal: 'Gang Kelinci, Jakarta',
        level_kekuatan: 3,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -2), false),
      tgl_panggil: formatDateFull(addDays(today, -2), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, 3), false),
      tgl_jatuh_tempo: formatDateFull(addDays(today, 3), false),
      tgl_pelepasan_raw: null,
      tgl_pelepasan: '—',
      mahar: 0,
      mahar_formatted: '~Rp0',
      status: 'Aktif' as const,
      is_terlambat: false,
      status_badge: '3 hari lagi',
    },
    // 3. Kakek Berjubah Putih - Bima Saputra (Terlambat 2 hari)
    {
      id: 1040,
      kode_transaksi: 'PMG-1040',
      pengamal: 'Bima Saputra',
      pengamal_email: 'bima@khodamku.test',
      khodam: {
        id: 4,
        nama: 'Kakek Berjubah Putih',
        kode_khodam: 'KHD-KBJ-001',
        sigil: 'KBJ',
        asal: 'Pertapaan Kendalisada',
        level_kekuatan: 3,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -7), false),
      tgl_panggil: formatDateFull(addDays(today, -7), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, -2), false),
      tgl_jatuh_tempo: formatDateFull(addDays(today, -2), false),
      tgl_pelepasan_raw: null,
      tgl_pelepasan: '—',
      mahar: 10000,
      mahar_formatted: '~Rp10.000',
      status: 'Terlambat' as const,
      is_terlambat: true,
      status_badge: 'Telat 2 hari',
    },
    // 4. Macan Putih - Sekar Ayu Lestari (Aktif, 1 hari lagi)
    {
      id: 1039,
      kode_transaksi: 'PMG-1039',
      pengamal: 'Sekar Ayu Lestari',
      pengamal_email: 'sekar@khodamku.test',
      khodam: {
        id: 1,
        nama: 'Macan Putih',
        kode_khodam: 'KHD-MCP-001',
        sigil: 'MCP',
        asal: 'Alas Purwo, Banyuwangi',
        level_kekuatan: 4,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -4), false),
      tgl_panggil: formatDateFull(addDays(today, -4), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, 1), false),
      tgl_jatuh_tempo: formatDateFull(addDays(today, 1), false),
      tgl_pelepasan_raw: null,
      tgl_pelepasan: '—',
      mahar: 0,
      mahar_formatted: '~Rp0',
      status: 'Aktif' as const,
      is_terlambat: false,
      status_badge: '1 hari lagi',
    },
    // 5. Tutup Panci - Raka Pratama (Dilepas)
    {
      id: 1035,
      kode_transaksi: 'PMG-1035',
      pengamal: 'Raka Pratama',
      pengamal_email: 'raka@khodamku.test',
      khodam: {
        id: 8,
        nama: 'Tutup Panci',
        kode_khodam: 'KHD-TPN-001',
        sigil: 'TPN',
        asal: 'Dapur Mbok Darmi, Sleman',
        level_kekuatan: 1,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -24), false),
      tgl_panggil: formatDateShort(addDays(today, -24), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, -19), false),
      tgl_jatuh_tempo: formatDateShort(addDays(today, -19), false),
      tgl_pelepasan_raw: toIsoDate(addDays(today, -20), false),
      tgl_pelepasan: formatDateShort(addDays(today, -20), false),
      mahar: 0,
      mahar_formatted: 'Rp0',
      status: 'Dilepas' as const,
      is_terlambat: false,
      status_badge: 'Dilepas',
    },
    // 6. Kulkas Dua Pintu - Sekar Ayu Lestari (Dilepas)
    {
      id: 1033,
      kode_transaksi: 'PMG-1033',
      pengamal: 'Sekar Ayu Lestari',
      pengamal_email: 'sekar@khodamku.test',
      khodam: {
        id: 7,
        nama: 'Kulkas Dua Pintu',
        kode_khodam: 'KHD-KDP-001',
        sigil: 'KDP',
        asal: 'Pasar Elektronik Glodok',
        level_kekuatan: 2,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -26), false),
      tgl_panggil: formatDateShort(addDays(today, -26), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, -21), false),
      tgl_jatuh_tempo: formatDateShort(addDays(today, -21), false),
      tgl_pelepasan_raw: toIsoDate(addDays(today, -19), false),
      tgl_pelepasan: formatDateShort(addDays(today, -19), false),
      mahar: 10000,
      mahar_formatted: 'Rp10.000',
      status: 'Dilepas' as const,
      is_terlambat: false,
      status_badge: 'Dilepas',
    },
    // 7. Harimau Sumatra - Bima Saputra (Dilepas)
    {
      id: 1030,
      kode_transaksi: 'PMG-1030',
      pengamal: 'Bima Saputra',
      pengamal_email: 'bima@khodamku.test',
      khodam: {
        id: 3,
        nama: 'Harimau Sumatra',
        kode_khodam: 'KHD-HRM-001',
        sigil: 'HRM',
        asal: 'Bukit Barisan, Sumatra Barat',
        level_kekuatan: 4,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -32), false),
      tgl_panggil: formatDateShort(addDays(today, -32), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, -27), false),
      tgl_jatuh_tempo: formatDateShort(addDays(today, -27), false),
      tgl_pelepasan_raw: toIsoDate(addDays(today, -27), false),
      tgl_pelepasan: formatDateShort(addDays(today, -27), false),
      mahar: 0,
      mahar_formatted: 'Rp0',
      status: 'Dilepas' as const,
      is_terlambat: false,
      status_badge: 'Dilepas',
    },
    // 8. Macan Putih - Raka Pratama (Dilepas)
    {
      id: 1028,
      kode_transaksi: 'PMG-1028',
      pengamal: 'Raka Pratama',
      pengamal_email: 'raka@khodamku.test',
      khodam: {
        id: 2,
        nama: 'Macan Putih',
        kode_khodam: 'KHD-MCP-002',
        sigil: 'MCP',
        asal: 'Gunung Lawu, Karanganyar',
        level_kekuatan: 5,
      },
      tgl_panggil_raw: toIsoDate(addDays(today, -39), false),
      tgl_panggil: formatDateShort(addDays(today, -39), false),
      tgl_jatuh_tempo_raw: toIsoDate(addDays(today, -34), false),
      tgl_jatuh_tempo: formatDateShort(addDays(today, -34), false),
      tgl_pelepasan_raw: toIsoDate(addDays(today, -32), false),
      tgl_pelepasan: formatDateShort(addDays(today, -32), false),
      mahar: 10000,
      mahar_formatted: 'Rp10.000',
      status: 'Dilepas' as const,
      is_terlambat: false,
      status_badge: 'Dilepas',
    },
  ];
}
