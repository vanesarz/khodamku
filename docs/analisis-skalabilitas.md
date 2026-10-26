# Analisis Skalabilitas

## 1. Lingkup Sistem

KhodamKu adalah aplikasi peminjaman ("pemanggilan") unit khodam dengan dua peran:

- **Admin (Juru Kunci):** kelola khodam, kategori, anggota; memantau dan melepas pemanggilan; melihat dan mencetak Buku Catatan Gaib.
- **Pengamal (anggota):** melihat katalog, memanggil maksimal 2 khodam aktif, melihat pemanggilan dan riwayat sendiri.

Aturan bisnis ada di `config/khodamku.php`: maksimal 2 khodam aktif, durasi 5 hari, denda Rp5.000 per hari terlambat.

Arsitektur:

```
Browser -> Next.js (frontend/, Route Handler sebagai proxy) -> Laravel REST API (/api/v1) -> Database
```

> [!IMPORTANT]
> Saat dokumen ini ditulis, halaman pengamal di frontend (katalog, pemanggilan, riwayat, dashboard pengamal) **belum memanggil Laravel**. Datanya berasal dari `frontend/src/lib/khodamData.ts` dan cookie (`frontend/app/api/khodams/route.ts`, `frontend/app/api/pemanggilan/route.ts`). Analisis di bawah berlaku untuk backend Laravel, yang sudah menyediakan endpoint pengamal (`/khodam`, `/pemanggilan`, `/pemanggilan/aktif`, `/riwayat`).

## 2. Lingkungan Operasi

| Komponen | Saat ini |
| --- | --- |
| Backend | PHP ^8.3, Laravel 13.38.0, `php artisan serve` (lokal) |
| Frontend | Node.js, Next.js 16.4.3 (`next dev`) |
| Database | SQLite (lokal, CI); MySQL/MariaDB disebut sebagai target produksi |
| Session/cache/queue | `database` (lihat `.env.example`) |
| Penyimpanan file | Disk `public` (`storage/app/public/khodams`), diakses lewat symlink `public/storage` |
| CI | GitHub Actions, Ubuntu, PHP 8.3, SQLite |

Belum ada konfigurasi deployment produksi (web server, process manager, Docker) di repo.

## 3. Masalah Saat Data dan Pengguna Bertambah

| No | Lokasi | Masalah | Status |
| --- | --- | --- | --- |
| 1 | `GET /khodam`, `GET /admin/khodam` | Mengambil seluruh khodam sekaligus | **Diperbaiki sebagian:** `per_page` opsional ditambahkan. Tanpa parameter, perilaku lama tetap |
| 2 | `GET /admin/buku-catatan-gaib` | Mengambil seluruh transaksi beserta relasi | **Diperbaiki sebagian:** `per_page` opsional. Ringkasan tetap menghitung semua baris yang lolos filter (tanpa relasi) |
| 3 | `GET /riwayat` | Mengambil seluruh riwayat milik pengamal | Belum dipaginasi; volume per pengamal relatif kecil |
| 4 | `GET /admin/pemanggilan/aktif` | Mengambil semua pemanggilan aktif | Dibatasi alami oleh aturan maks 2 aktif per anggota (maks 2 x jumlah anggota) |
| 5 | Ringkasan mahar (dashboard, buku catatan, riwayat) | Denda dihitung per baris di PHP, bukan agregasi SQL | Belum dioptimasi |
| 6 | Pencarian `like '%kata%'` | Tidak bisa memakai index B-tree | Belum dioptimasi |
| 7 | Filter `whereDate(...)` | Membungkus kolom dengan fungsi, index kurang efektif | Belum dioptimasi |
| 8 | Index tabel `pemanggilans` | Hanya foreign key; belum ada index gabungan `(status, tgl_jatuh_tempo)` atau `(user_id, status)` | Belum ditambahkan |
| 9 | `GET /admin/users` | Sudah `paginate(20)` | Sudah aman |
| 10 | Penguncian `lockForUpdate` di `PemanggilanService` | Efektif di MySQL; diabaikan di SQLite | Perlu MySQL di produksi |

### Contoh pagination opsional

```http
GET /api/v1/khodam                      -> semua data, tanpa "meta" (sama seperti sebelumnya)
GET /api/v1/khodam?per_page=20&page=2   -> 20 data, dengan "meta"
```

```json
"meta": { "current_page": 2, "per_page": 20, "total": 57, "last_page": 3 }
```

`per_page` harus bilangan bulat 1–100. Nilai di luar itu ditolak dengan 422. Implementasi: `app/Support/Halaman.php`.

## 4. Perkiraan Jumlah Data

> Angka berikut adalah **asumsi perencanaan**, bukan hasil pengukuran.

Asumsi: rata-rata 2 pemanggilan per anggota per bulan, 1 profil per user, ukuran rata-rata baris ±300 byte (termasuk overhead index).

| Tabel | Pelatihan (±10 anggota) | 1.000 anggota | 10.000 anggota |
| --- | --- | --- | --- |
| `users` / `profiles` | ±10 | 1.000 | 10.000 |
| `khodams` | puluhan | ±200 (asumsi) | ±1.000 (asumsi) |
| `pemanggilans` per tahun | ±240 | ±24.000 | ±240.000 |
| `pemanggilans` aktif bersamaan (maks) | 20 | 2.000 | 20.000 |
| Ukuran data `pemanggilans` per tahun | < 1 MB | ±7 MB | ±70 MB |
| Foto khodam (maks 2 MB per file) | < 100 MB | ±400 MB (asumsi 200 foto) | ±2 GB (asumsi 1.000 foto) |

## 5. Kebutuhan Perangkat Keras

> Spesifikasi berikut adalah **estimasi awal**. Kapasitas nyata harus divalidasi dengan uji beban.

| Skenario | Backend + Database | Frontend | Database | Catatan |
| --- | --- | --- | --- | --- |
| Pelatihan (1 kelas, ±10–30 pengguna) | 1 laptop: 2 core, 4 GB RAM | Sama dengan backend (`next dev`) | SQLite | Cukup untuk demo dan UAT |
| 1.000 anggota | 1 VPS: 2 vCPU, 4 GB RAM, SSD 40 GB | Di VPS yang sama (`next start`) | MySQL di VPS yang sama | Perlu web server (Nginx + PHP-FPM) dan backup harian |
| 10.000 anggota | 2 server aplikasi: 2–4 vCPU, 4–8 GB RAM | Terpisah atau di server aplikasi | MySQL terpisah: 4 vCPU, 8 GB RAM | Load balancer, session/cache di Redis, file di object storage |

Hasil uji beban yang perlu diisi:

| Ukuran | Pelatihan | 1.000 anggota | 10.000 anggota |
| --- | --- | --- | --- |
| Request per detik `GET /khodam?per_page=20` | [ISI SETELAH DIJALANKAN] | [ISI SETELAH DIJALANKAN] | [ISI SETELAH DIJALANKAN] |
| Latensi p95 `POST /pemanggilan` | [ISI SETELAH DIJALANKAN] | [ISI SETELAH DIJALANKAN] | [ISI SETELAH DIJALANKAN] |
| Latensi p95 `GET /admin/buku-catatan-gaib?per_page=50` | [ISI SETELAH DIJALANKAN] | [ISI SETELAH DIJALANKAN] | [ISI SETELAH DIJALANKAN] |

## 6. Rekomendasi

Urut dari dampak terbesar:

1. **Sambungkan halaman pengamal di frontend ke Laravel.** Tanpa ini, data pinjaman pengamal hanya tersimpan di cookie browser masing-masing dan tidak terlihat oleh admin.
2. **Pakai `per_page` di frontend** untuk katalog dan Buku Catatan Gaib, lalu jadikan pagination default setelah frontend siap.
3. **Tambahkan index** `pemanggilans(status, tgl_jatuh_tempo)` dan `pemanggilans(user_id, status)` lewat migrasi baru.
4. **Hitung ringkasan mahar di SQL**: `SUM(mahar)` untuk status `dilepas`; untuk aktif terlambat, hitung selisih hari di query.
5. **Ganti `whereDate` dengan perbandingan rentang** (`tgl_jatuh_tempo < '2026-10-26'`) agar index terpakai.
6. **Jalankan CI dengan MySQL** agar perilaku `lockForUpdate` dan tipe data teruji.
7. **Pindahkan session, cache, dan queue ke Redis** pada skenario 10.000 anggota.
8. **Simpan foto di object storage** (driver `s3` Laravel) saat lebih dari satu server aplikasi.
