# Analisis UX: Jumlah Aksi per Skenario

Jumlah aksi dihitung dari kode halaman di `frontend/app/` per 26 Oktober 2026. Satu aksi = satu klik, satu isian field, atau satu pilihan. Navigasi awal dihitung dari halaman dashboard peran masing-masing (sidebar sudah terlihat).

Batas atas ditetapkan sebagai target desain proyek ini:

- **Tugas harian** (login, pinjam, lihat pinjaman, pelepasan): maksimal **4 aksi**.
- **Entri data** (kelola data): maksimal **jumlah field wajib + 3 aksi**.
- **Laporan** (cetak): maksimal **3 aksi** tanpa filter.

## Ringkasan

| Skenario | Peran | Aksi saat ini | Batas atas | Status | Alternatif lebih singkat |
| --- | --- | --- | --- | --- | --- |
| Login | Semua | 3 (atau 2 dengan kartu demo) | 4 | Memenuhi | Tetap login lewat Enter setelah isi sandi |
| Pinjam khodam | Pengamal | 3 | 4 | Memenuhi | 2 aksi: tombol "Panggil" langsung dari dashboard |
| Lihat pinjaman | Pengamal | 1 | 4 | Memenuhi | Ringkasan pinjaman sudah tampil di dashboard (0 aksi) |
| Pelepasan | Admin | 3 | 4 | Memenuhi | 2 aksi: tombol lepas cepat di dashboard admin |
| Kelola data (tambah khodam) | Admin | 9 | 9 (6 field wajib + 3) | Tepat di batas | Isi otomatis kode khodam |
| Kelola data (ubah anggota) | Admin | 3 + jumlah field diubah | 2 field wajib + 3 = 5 | Memenuhi bila mengubah ≤ 2 field | – |
| Cetak riwayat | Admin | 3 (+0–4 untuk filter) | 3 tanpa filter | Memenuhi | Simpan filter terakhir |

## 1. Login

Halaman: `frontend/app/login/page.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Isi email |
| 2 | Isi kata sandi |
| 3 | Klik **Masuk** (atau Enter) |

Dengan kartu "Coba Akun Demo": klik kartu (email dan sandi terisi otomatis), lalu klik **Masuk** = **2 aksi**. Setelah login, pengguna diarahkan sesuai peran (`/admin/dashboard` atau `/dashboard`).

## 2. Pinjam (Pemanggilan) Khodam

Halaman: `frontend/app/katalog/page.tsx`, modal `frontend/src/components/features/RitualPemanggilanModal.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Klik **Katalog Khodam** di sidebar |
| 2 | Klik **Panggil** pada kartu khodam yang tersedia |
| 3 | Klik tombol konfirmasi ritual di modal |

Opsional: cari/filter (+1–2 aksi) dan pilih durasi 3/5/7 hari (+1).

> [!WARNING]
> Pilihan durasi 3/5/7 hari hanya ada di frontend. Backend Laravel memakai durasi tetap 5 hari (`config/khodamku.php`). Alur ini juga belum memanggil Laravel; kontrak disimpan di cookie (`frontend/app/api/pemanggilan/route.ts`).

**Alternatif:** tampilkan tombol "Panggil" pada daftar khodam tersedia di dashboard pengamal, sehingga langkah 1 hilang (2 aksi). Hapus pilihan durasi atau sambungkan ke backend agar tidak menyesatkan.

## 3. Lihat Pinjaman

Halaman: `frontend/app/pemanggilan/page.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Klik **Pemanggilan Saya** di sidebar |

**Alternatif:** dashboard pengamal sudah memuat data pemanggilan (`fetch('/api/pemanggilan')` di `frontend/app/dashboard/page.tsx`), sehingga ringkasan bisa dilihat tanpa aksi tambahan.

## 4. Pelepasan Khodam

Halaman: `frontend/app/admin/pemanggilan/page.tsx`, modal `frontend/src/components/features/LepasKhodamModal.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Klik **Pemanggilan Aktif** di sidebar |
| 2 | Klik tombol lepas pada baris pemanggilan |
| 3 | Klik **konfirmasi** di modal (mahar denda ditampilkan sebelum konfirmasi) |

Opsional: pilih tab `Terlambat` / `Masih Berjalan` (+1).

**Alternatif:** tambahkan tombol lepas pada daftar "Jatuh Tempo Terdekat" di dashboard admin (2 aksi). Modal konfirmasi tetap dipertahankan karena pelepasan mencatat mahar dan tidak bisa dibatalkan.

## 5. Kelola Data

### Tambah khodam

Halaman: `frontend/app/admin/kelola/khodam/page.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Klik **Khodam** di sidebar |
| 2 | Klik **Tambah** |
| 3–7 | Isi kode, nama, asal, level kekuatan, deskripsi (5 field) |
| 8 | Pilih minimal 1 kategori |
| 9 | Klik **Simpan** |

Total 9 aksi, tepat di batas (6 isian wajib + 3).

**Alternatif:** buat kode khodam otomatis dari kategori dan nomor urut (−1 aksi).

> [!NOTE]
> Form ini mengirim JSON, sehingga foto belum bisa diunggah dari UI walaupun backend menerima field `foto`.

### Ubah data anggota

Halaman: `frontend/app/admin/users/page.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Klik **Pengamal** di sidebar |
| 2 | Klik ikon pensil pada baris anggota |
| 3..n | Ubah field yang diperlukan (form sudah terisi data lama) |
| n+1 | Klik **Simpan Perubahan** |

## 6. Cetak Riwayat

Halaman: `frontend/app/admin/buku-catatan-gaib/page.tsx`

| Langkah | Aksi |
| --- | --- |
| 1 | Klik **Buku Catatan Gaib** di sidebar |
| 2 | Klik **Cetak** (`window.print()`) |
| 3 | Konfirmasi di dialog cetak browser |

Opsional: filter pengamal, status, dan rentang tanggal (+1–4). Elemen navigasi disembunyikan saat cetak (`print:hidden`).

Pengamal belum punya tombol cetak di `frontend/app/riwayat/page.tsx`.

**Alternatif:** simpan filter terakhir di URL query agar laporan berkala bisa dicetak ulang tanpa memilih filter lagi.

## Waktu Penyelesaian

| Skenario | Waktu rata-rata |
| --- | --- |
| Login | [ISI SETELAH DIJALANKAN] |
| Pinjam khodam | [ISI SETELAH DIJALANKAN] |
| Pelepasan | [ISI SETELAH DIJALANKAN] |
| Tambah khodam | [ISI SETELAH DIJALANKAN] |
| Cetak riwayat | [ISI SETELAH DIJALANKAN] |
