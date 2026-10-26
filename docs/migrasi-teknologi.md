# Migrasi Teknologi

## 1. Dari Pencatatan Manual ke Aplikasi Web

| Aspek | Pencatatan manual (buku/spreadsheet) | Aplikasi web KhodamKu |
| --- | --- | --- |
| Batas 2 khodam aktif | Dicek manual oleh Juru Kunci | Ditolak otomatis dengan 422 (`KuotaRagaPenuhException`) |
| Khodam ganda dipinjam | Bisa terjadi bila catatan terlambat diperbarui | Ditolak otomatis (`KhodamSedangBersemayamException`), baris dikunci dalam transaksi |
| Jatuh tempo | Dihitung manual | `tgl_panggil` + 5 hari (`config/khodamku.php`) |
| Denda | Dihitung manual, rawan salah | `DendaHarian`: hari terlambat x Rp5.000 |
| Riwayat | Tersebar di beberapa catatan | Buku Catatan Gaib dengan filter pengamal, status, dan tanggal, bisa dicetak |
| Akses | Hanya di lokasi buku disimpan | Browser, dengan login dan pembagian peran |
| Jejak data | Tidak ada | Tabel `pemanggilans` menyimpan tanggal panggil, jatuh tempo, pelepasan, dan mahar |

Langkah migrasi data dari catatan manual (belum ada skrip impor di repo):

1. Masukkan master kategori dan khodam lewat menu admin, atau lewat seeder (`database/seeders`).
2. Daftarkan anggota lewat menu **Pengamal** (`POST /admin/users`).
3. Masukkan pemanggilan yang masih berjalan. Saat ini belum ada fitur impor, sehingga pemanggilan lama perlu dimasukkan lewat seeder atau skrip.

## 2. Dari Aplikasi Monolit ke REST API + Next.js

Laravel bisa dipakai monolit (Blade). Repo ini memisahkan backend dan frontend:

| Aspek | Monolit Laravel + Blade | REST API Laravel + Next.js (dipakai) |
| --- | --- | --- |
| Struktur | Satu aplikasi, view dirender server | `routes/api.php` (prefix `/api/v1`) + aplikasi `frontend/` terpisah |
| Autentikasi | Session cookie | Token Sanctum, disimpan di cookie httpOnly oleh Route Handler Next.js |
| Klien lain (mobile) | Perlu API terpisah | Bisa memakai API yang sama |
| Pengujian | Test HTTP + view | Test API dengan `assertJsonPath`, kontrak didokumentasikan di `DOKUMENTASI_API.md` |
| Deploy | Satu server | Dua proses (PHP + Node.js) |
| Kompleksitas | Lebih rendah | Lebih tinggi: CORS/proxy, dua dependensi, dua pipeline build |

Kondisi migrasi saat ini: halaman admin, login, dan profil sudah memanggil API Laravel. Halaman pengamal (katalog, pemanggilan, riwayat, dashboard) masih memakai data mock di `frontend/src/lib/khodamData.ts`, sehingga migrasi belum selesai.

## 3. Database: MySQL untuk Produksi, SQLite untuk CI

| Aspek | SQLite | MySQL / MariaDB |
| --- | --- | --- |
| Dipakai di | Lokal (`.env.example`: `DB_CONNECTION=sqlite`), CI (`.github/workflows/laravel.yml`), test (`phpunit.xml`: `:memory:`) | Disebut README sebagai database produksi |
| Instalasi | Tidak perlu server | Perlu server database |
| Konkurensi tulis | Satu penulis per waktu | Banyak koneksi bersamaan, kunci level baris |
| `lockForUpdate` | Diabaikan | Menghasilkan `SELECT ... FOR UPDATE` |
| Tipe `enum` | Disimulasikan dengan CHECK | Tipe native |
| Kecepatan CI | Sangat cepat (in-memory) | Lebih lambat, perlu service container |

Konsekuensi: kode yang lulus di CI belum tentu berperilaku sama di MySQL, terutama penguncian baris di `PemanggilanService`. Rekomendasi: tambahkan job CI dengan service MySQL.

## 4. Fitur Terkini yang Dipakai

### Laravel 13 / PHP 8.3+

| Fitur | Lokasi |
| --- | --- |
| Konfigurasi aplikasi fluent (`withRouting(apiPrefix: 'api/v1')`, `withMiddleware`, `withExceptions`) | `bootstrap/app.php` |
| `shouldRenderJsonWhen` agar error API selalu JSON | `bootstrap/app.php` |
| Method `casts()` dan cast `hashed` untuk password | `app/Models/User.php` |
| Exception dengan `render()` otomatis dan interface `ShouldntReport` | `app/Exceptions/PemanggilanDitolakException.php` |
| Form Request | `app/Http/Requests/Admin/` |
| Service container: binding interface ke implementasi | `app/Providers/AppServiceProvider.php` |
| Constructor property promotion | `app/Services/PemanggilanService.php` |
| Ekspresi `match` | `app/Support/StatusJatuhTempo.php` |
| Intersection type (`PemanggilanRepositoryInterface&MockInterface`) | `tests/Unit/PemanggilanServiceTest.php` |

### Next.js 16 / React 19 / Tailwind 4

| Fitur | Lokasi |
| --- | --- |
| App Router dan Route Handler sebagai proxy API | `frontend/app/`, `frontend/app/api/` |
| `params` asinkron (`params: Promise<{ id: string }>`) | `frontend/app/api/admin/users/[id]/route.ts` |
| Turbopack dengan loader `@tailwindcss/turbopack` | `frontend/next.config.ts` |
| `cacheComponents`, `partialPrefetching` | `frontend/next.config.ts` |
| `next/font` (Geist) | `frontend/app/layout.tsx` |
| Tailwind 4: `@import "tailwindcss"` dan `@theme inline` | `frontend/app/globals.css` |
