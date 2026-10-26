# Log Debugging

Isi log ini hanya masalah yang benar-benar ditemukan **dan** diselesaikan selama fase pengembangan dan pemasangan lokal (Oktober 2026). Sumber: riwayat git dan catatan sesi pengerjaan. Masalah yang ditemukan tetapi belum diperbaiki dicatat terpisah di bagian akhir.

## A. Bug Aplikasi

### A1. Akun demo di halaman login tidak bisa dipakai

| Item | Isi |
| --- | --- |
| Gejala | Klik kartu "Mbah Darmo" atau "Raka Pratama" di bagian "Coba Akun Demo", lalu **Masuk**: login gagal |
| Kode error | HTTP 422 dari `POST /api/v1/login`, pesan `These credentials do not match our records.` |
| Penyebab | Kartu demo di `frontend/app/login/page.tsx` mengisi `admin@demo.test` dan `pengamal@demo.test`. Seeder hanya membuat `admin@example.com` (`AdminUserSeeder`) serta `sekar@`, `bima@`, `raka@khodamku.test` (`UserSeeder`) |
| Perbaikan | Kartu demo diganti ke `admin@example.com` dan `raka@khodamku.test` (sandi `password123`, sesuai seeder) |
| Commit | Branch `docs/analisis-dan-pagination` (lihat `CHANGELOG.md` versi 1.1.0) |

### A2. Field `role` tidak divalidasi saat admin menambah user

| Item | Isi |
| --- | --- |
| Gejala | `POST /admin/users` menerima `role` apa pun atau tanpa `role`. `DOKUMENTASI_API.md` mencantumkan peringatan "role belum divalidasi" |
| Kode error | Tidak direproduksi. Dari kode: nilai di luar enum `admin`/`pengamal` atau `null` akan ditolak oleh constraint database, bukan oleh validasi |
| Penyebab | Validasi inline di `AdminUserController::store` tidak memuat aturan untuk `role`; controller memakai `$request->role` langsung |
| Perbaikan | Validasi dipindah ke `StoreUserRequest` dengan aturan `role: required, in:admin,pengamal`. Nilai tidak valid kini ditolak 422. Ditambah test `test_create_user_fails_when_role_is_invalid` |
| Commit | `b854fd9` feat: tambah ubah data user oleh admin dan perbaiki versi di dokumen |

## B. Masalah Lingkungan (Pemasangan Lokal)

Masalah berikut tidak membutuhkan perubahan kode aplikasi, tetapi ditemukan dan diselesaikan saat menjalankan proyek di Windows.

### B1. Versi PHP tidak memenuhi syarat `composer.json`

| Item | Isi |
| --- | --- |
| Gejala | `composer install` tidak bisa memakai PHP di PATH terminal |
| Kode error | Teks error tidak tercatat. PHP di terminal versi 8.2.12 (XAMPP), sedangkan `composer.json` mensyaratkan `php: ^8.3` |
| Penyebab | PATH Windows mendahulukan `D:\xampp\php` |
| Perbaikan | Menjalankan Composer dan Artisan dengan PHP Laragon (`C:\laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.exe`, yang sebenarnya berisi PHP 8.5.12) dan menambahkannya ke PATH di atas XAMPP |
| Commit | – (lingkungan) |

### B2. Disk C: penuh

| Item | Isi |
| --- | --- |
| Gejala | Perintah tidak bisa membuat file output; `php artisan key:generate` belum bisa dijalankan |
| Kode error | Tidak tercatat |
| Penyebab | Ruang kosong drive C: habis (cache Composer/npm dan Temp menulis ke C:) |
| Perbaikan | Pengguna mengosongkan C:, lalu `php artisan key:generate` berhasil (`APP_KEY` terisi) |
| Commit | – (lingkungan) |

### B3. `next` tidak dikenali

| Item | Isi |
| --- | --- |
| Gejala | `npm run dev` di `frontend/` gagal |
| Kode error | `'next' is not recognized as an internal or external command, operable program or batch file.` |
| Penyebab | `npm install` belum dijalankan di folder `frontend/` |
| Perbaikan | Menjalankan `npm install` di `frontend/` |
| Commit | – (lingkungan) |

### B4. Karakter `&` di path proyek memutus skrip npm

| Item | Isi |
| --- | --- |
| Gejala | Setelah `npm install`, `npm run dev` tetap gagal |
| Kode error | `'SERTIFIKASI\khodamku\frontend\node_modules\.bin\' is not recognized as an internal or external command` dan `Error: Cannot find module 'D:\DOCUMENT\SEMESTER 7\next\dist\bin\next'` (`MODULE_NOT_FOUND`) |
| Penyebab | Path `D:\DOCUMENT\SEMESTER 7\PELATIHAN & SERTIFIKASI\...` mengandung `&`. npm menjalankan skrip lewat `cmd.exe`, yang memperlakukan `&` sebagai pemisah perintah |
| Perbaikan | Workaround: `node node_modules\next\dist\bin\next dev` (Next.js 16.4.3 berjalan di `http://localhost:3000`). Perbaikan permanen yang disarankan: ganti nama folder tanpa `&` |
| Commit | – (lingkungan) |

## C. Ditemukan, Belum Diperbaiki

| Temuan | Lokasi | Catatan |
| --- | --- | --- |
| Test upload gagal: `GD extension is not installed.` | `tests/Feature/Admin/Kelola/KelolaKhodamTest.php` | Ekstensi GD tidak aktif di PHP lokal; CI memakai `setup-php` |
| Halaman pengamal memakai data mock, belum memanggil Laravel | `frontend/app/api/khodams/route.ts`, `frontend/app/api/pemanggilan/route.ts` | Pinjaman pengamal tersimpan di cookie, tidak terlihat oleh admin |
| Pilihan durasi 3/5/7 hari hanya di frontend | `frontend/src/components/features/RitualPemanggilanModal.tsx` | Backend memakai durasi tetap 5 hari |
| Animasi modal tidak berjalan | Class `animate-in fade-in zoom-in-95` | Plugin animasi Tailwind tidak terpasang |
| Upload foto khodam tidak tersedia di UI | `frontend/app/admin/kelola/khodam/page.tsx` | Form mengirim JSON |
| Peringatan Next.js: `The "middleware" file convention is deprecated. Please use "proxy" instead.` | `frontend/middleware.ts` | Muncul saat `next dev` |
