import { Khodam } from '@/types';

export const MASTER_KHODAMS: Khodam[] = [
  {
    id: 1,
    kode_khodam: 'KHD-MCP-001',
    nama: 'Macan Putih',
    asal: 'Alas Purwo, Banyuwangi',
    level_kekuatan: 4,
    deskripsi: 'Sosok macan putih sakti penjaga gerbang gaib ujung timur Jawa.',
    foto: null,
    status: 'Sedang Bersemayam',
    is_tersedia: false,
    kategoris: [
      { id: 1, nama: 'Penjaga Rumah' },
      { id: 4, nama: 'Kewibawaan' },
    ],
  },
  {
    id: 2,
    kode_khodam: 'KHD-MCP-002',
    nama: 'Macan Putih',
    asal: 'Gunung Lawu, Karanganyar',
    level_kekuatan: 5,
    deskripsi: 'Siluman macan putih bertuah penunggu kabut mistis puncak Lawu.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 1, nama: 'Penjaga Rumah' },
      { id: 4, nama: 'Kewibawaan' },
    ],
  },
  {
    id: 3,
    kode_khodam: 'KHD-HRM-001',
    nama: 'Harimau Sumatra',
    asal: 'Bukit Barisan, Sumatra Barat',
    level_kekuatan: 4,
    deskripsi: 'Aura rimba Sumatra yang kuat untuk proteksi dan wibawa tingkat tinggi.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 4, nama: 'Kewibawaan' },
      { id: 5, nama: 'Penolak Bala' },
    ],
  },
  {
    id: 4,
    kode_khodam: 'KHD-KBJ-001',
    nama: 'Kakek Berjubah Putih',
    asal: 'Pertapaan Kendalisada',
    level_kekuatan: 3,
    deskripsi: 'Sosok sepuh bijak penuntun ketenangan batin dan penangkal marabahaya.',
    foto: null,
    status: 'Sedang Bersemayam',
    is_tersedia: false,
    kategoris: [
      { id: 3, nama: 'Pelindung Ujian' },
      { id: 5, nama: 'Penolak Bala' },
    ],
  },
  {
    id: 5,
    kode_khodam: 'KHD-NGH-001',
    nama: 'Naga Hijau',
    asal: 'Telaga Sarangan, Magetan',
    level_kekuatan: 5,
    deskripsi: 'Naga mistis pembawa aura kemakmuran dan pelaris dagangan.',
    foto: null,
    status: 'Sedang Bersemayam',
    is_tersedia: false,
    kategoris: [{ id: 2, nama: 'Penglaris Dagangan' }],
  },
  {
    id: 6,
    kode_khodam: 'KHD-KCO-001',
    nama: 'Kucing Oren Barbar',
    asal: 'Gang Kelinci, Jakarta',
    level_kekuatan: 3,
    deskripsi: 'Penjaga rumah yang lincah, berani, dan siap mengusir energi negatif.',
    foto: null,
    status: 'Sedang Bersemayam',
    is_tersedia: false,
    kategoris: [{ id: 1, nama: 'Penjaga Rumah' }],
  },
  {
    id: 7,
    kode_khodam: 'KHD-KDP-001',
    nama: 'Kulkas Dua Pintu',
    asal: 'Pasar Elektronik Glodok',
    level_kekuatan: 2,
    deskripsi: 'Khodam pendingin emosi dan penglaris perniagaan kuliner.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 2, nama: 'Penglaris Dagangan' }],
  },
  {
    id: 8,
    kode_khodam: 'KHD-TPN-001',
    nama: 'Tutup Panci',
    asal: 'Dapur Bu Sum, Solo',
    level_kekuatan: 1,
    deskripsi: 'Menutup masa lalu dan mempermudah menemukan jodoh yang pas pasangannya.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 6, nama: 'Pencari Jodoh' }],
  },
];

export function findKhodamById(idOrCode: number | string): Khodam | undefined {
  if (typeof idOrCode === 'number') {
    return MASTER_KHODAMS.find((k) => k.id === idOrCode);
  }
  return MASTER_KHODAMS.find(
    (k) => k.kode_khodam.toLowerCase() === String(idOrCode).toLowerCase()
  );
}
