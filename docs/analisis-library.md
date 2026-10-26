# Analisis Library

Alasan memakai library yang sudah ada dibanding membuat sendiri, rencana integrasi, dan limitasinya.

## Ringkasan

| Library | Status di repo | Menggantikan pekerjaan apa |
| --- | --- | --- |
| Laravel Sanctum 4.3.3 | Terpasang, dipakai | Sistem token login buatan sendiri |
| Next.js 16.4.3 | Terpasang, dipakai | Router, bundler, dan server SSR buatan sendiri |
| Tailwind CSS 4.3.3 | Terpasang, dipakai | File CSS besar per halaman |
| PHPUnit 12.5.40 | Terpasang, dipakai | Skrip pengujian manual |
| Laravel Pint 1.32.1 | Terpasang, dipakai | Aturan format kode yang dijaga manual |
| Larastan | **Belum terpasang** | Pemeriksaan tipe statis manual |

## 1. Laravel Sanctum

**Alasan:** membuat token sendiri berarti harus menangani pembuatan token acak, hashing, pencabutan, dan middleware autentikasi. Sanctum sudah menyediakan semuanya: token disimpan ter-hash di `personal_access_tokens`, dicek oleh middleware `auth:sanctum`.

**Integrasi di repo:**
- `User` memakai trait `HasApiTokens`.
- Semua route di `routes/api.php` dibungkus `auth:sanctum`; route admin ditambah middleware `role:admin` (`app/Http/Middleware/CheckRole.php`).
- Frontend menyimpan token di cookie `khodamku_token` (httpOnly) lewat Route Handler `frontend/app/api/auth/login/route.ts`, lalu meneruskannya sebagai header `Authorization: Bearer`.

**Limitasi:**
- Token tidak kedaluwarsa kecuali `expiration` di `config/sanctum.php` diatur.
- Otorisasi berbasis peran masih sederhana (satu kolom `role`), belum memakai Policy/Gate.

## 2. Next.js

**Alasan:** routing berbasis folder, Route Handler untuk proxy API, optimasi font (`next/font`) dan gambar (`next/image`), serta bundler Turbopack tersedia tanpa konfigurasi manual.

**Integrasi di repo:**
- App Router di `frontend/app/`, halaman admin di `frontend/app/admin/`.
- Route Handler di `frontend/app/api/` meneruskan request ke `LARAVEL_API_URL` (default `http://localhost:8000/api/v1`).
- `frontend/middleware.ts` mengarahkan pengguna berdasarkan cookie token dan peran.

**Limitasi:**
- Halaman pengamal (katalog, pemanggilan, riwayat) masih memakai data mock dan cookie, belum memanggil Laravel.
- `middleware.ts` ditandai deprecated oleh Next.js 16 (diganti `proxy`).
- Proxy menambah satu lompatan jaringan per request.

**Rencana integrasi:** ganti `frontend/app/api/khodams/route.ts` dan `frontend/app/api/pemanggilan/route.ts` agar meneruskan ke `GET /khodam`, `POST /pemanggilan`, `GET /pemanggilan/aktif`, dan `GET /riwayat` seperti pola Route Handler admin.

## 3. Tailwind CSS

**Alasan:** konsistensi warna dan jarak tanpa menulis CSS kustom per komponen. Tema didefinisikan sekali di `frontend/app/globals.css` (`@import "tailwindcss"`, `@theme inline`).

**Integrasi di repo:** dimuat lewat loader `@tailwindcss/turbopack` di `frontend/next.config.ts`. Varian `print:` dipakai di halaman Buku Catatan Gaib untuk tampilan cetak.

**Limitasi:**
- Class panjang di JSX sulit dibaca; banyak warna ditulis literal (`bg-[#12100e]`) alih-alih token tema.
- Class `animate-in fade-in zoom-in-95` dipakai di modal, tetapi plugin animasinya tidak terpasang, sehingga class tersebut tidak menghasilkan animasi.

## 4. PHPUnit

**Alasan:** sudah terintegrasi dengan Laravel (`RefreshDatabase`, `actingAs`, `assertJsonPath`). Membuat runner sendiri tidak memberi nilai tambah.

**Integrasi di repo:** test di `tests/Feature` (per area: Admin, Auth, Pengamal) dan `tests/Unit` (`DendaHarianTest`, `PemanggilanServiceTest` dengan Mockery). Database test: SQLite `:memory:` (`phpunit.xml`). Dijalankan di CI.

**Limitasi:** tidak ada laporan coverage (CI memakai `coverage: none`); SQLite tidak menguji perilaku khusus MySQL.

## 5. Laravel Pint

**Alasan:** format kode otomatis dengan preset Laravel, tanpa file konfigurasi.

**Integrasi di repo:** dijalankan manual (`vendor/bin/pint --dirty`) sebelum commit.

**Limitasi:** belum dijalankan di CI, sehingga file yang belum disentuh masih bisa berformat lama.

**Rencana:** tambahkan langkah `vendor/bin/pint --test` di `.github/workflows/laravel.yml`.

## 6. Larastan

**Status: belum dipakai.** Tidak ada di `composer.json` dan tidak ada `phpstan.neon` di repo, sehingga tidak ada hasil analisis statis yang bisa dilaporkan.

**Alasan dipertimbangkan:** Larastan (PHPStan untuk Laravel) menemukan kesalahan tipe dan pemanggilan method yang tidak ada tanpa menjalankan kode. Membuat pemeriksa statis sendiri tidak realistis.

**Rencana integrasi:**
1. `composer require --dev larastan/larastan` (perlu persetujuan tim karena menambah dependensi).
2. Buat `phpstan.neon` dimulai dari level rendah (mis. 5), dengan path `app/`.
3. Jalankan `vendor/bin/phpstan analyse`, perbaiki temuan, lalu naikkan level bertahap.
4. Tambahkan ke CI setelah hasilnya bersih.

**Limitasi yang diperkirakan:** dukungan tipe untuk query Eloquent dinamis tidak sempurna; mungkin perlu baseline untuk kode lama.
