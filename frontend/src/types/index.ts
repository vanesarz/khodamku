export interface Profile {
  id?: number;
  user_id?: number;
  no_hp: string;
  alamat: string;
  weton: string;
  tanggal_lahir: string | null;
  foto: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'pengamal';
  email_verified_at?: string | null;
  profile?: Profile;
  created_at?: string;
  updated_at?: string;
}

export interface Kategori {
  id: number;
  nama: string;
  deskripsi?: string;
  jumlah_khodam?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Khodam {
  id: number;
  kode_khodam: string;
  nama: string;
  asal: string;
  level_kekuatan: number;
  deskripsi: string;
  foto: string | null;
  status: 'Sedang Bersemayam' | 'Menunggu Dipanggil';
  is_tersedia: boolean;
  kategoris: Array<{
    id: number;
    nama: string;
  }>;
}

export interface PemanggilanItem {
  id: number;
  kode_transaksi: string;
  pengamal: string;
  khodam: {
    nama: string;
    kode_khodam: string;
  };
  tgl_panggil: string;
  tgl_panggil_formatted?: string;
  tgl_jatuh_tempo: string;
  tgl_jatuh_tempo_formatted?: string;
  tgl_pelepasan?: string | null;
  tgl_pelepasan_formatted?: string;
  status_badge: string;
  estimasi_mahar: number;
  mahar?: number;
  mahar_formatted?: string;
  status?: string;
  is_terlambat: boolean;
}

export interface ActivePemanggilanResponse {
  message: string;
  tabs: {
    semua: number;
    terlambat: number;
    masih_berjalan: number;
  };
  data: PemanggilanItem[];
}

export interface DashboardData {
  tanggal: string;
  ringkasan: {
    terlambat: number;
    estimasi_mahar_terlambat: number;
  };
  statistik: {
    jumlah_unit: number;
    menunggu_dipanggil: number;
    sedang_bersemayam: number;
    pemanggilan_aktif: number;
    terlambat: number;
  };
  jatuh_tempo_terdekat: Array<{
    id: number;
    khodam: {
      nama: string;
      kode_khodam: string;
    };
    pengamal: string;
    tgl_jatuh_tempo: string;
    status_badge: string;
    is_terlambat: boolean;
  }>;
  kategori: Array<{
    id: number;
    nama: string;
    jumlah_khodam: number;
  }>;
  pengamal_terdaftar: number;
  mahar_terkumpul: number;
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: 'Bearer';
  user: User;
}
