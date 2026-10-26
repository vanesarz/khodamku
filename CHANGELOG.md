# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [1.1.0] - 2026-10-26

### Ditambahkan
- Endpoint `POST /api/v1/admin/users/{id}` untuk mengubah nama, email, kata sandi (opsional), nomor HP, dan alamat anggota dalam satu transaksi. Form edit anggota di halaman admin **Pengamal** (`b854fd9`).
- Form Request `StoreUserRequest` dan `UpdateUserRequest` (`b854fd9`).
- Pagination opsional (`per_page`, `page`) pada `GET /khodam`, `GET /admin/khodam`, dan `GET /admin/buku-catatan-gaib`. Tanpa parameter, respons tidak berubah.
- `config/khodamku.php` berisi aturan bisnis: maksimal 2 khodam aktif, durasi 5 hari, denda Rp5.000 per hari (`d1ee6b1`).
- Interface `KebijakanDenda` dengan implementasi `DendaHarian` (default) dan `DendaTanpaBiaya` (`d1ee6b1`).
- `PemanggilanRepositoryInterface` dan `EloquentPemanggilanRepository` (`d1ee6b1`).
- `PemanggilanService` untuk pinjam dan lepas, dibungkus `DB::transaction` dengan `lockForUpdate` (`d1ee6b1`).
- Exception `KuotaRagaPenuhException` dan `KhodamSedangBersemayamException` yang dirender menjadi JSON 422 (`d1ee6b1`).
- Helper `StatusJatuhTempo` (badge "Telat X hari" / "Hari ini" / "X hari lagi") dan `Halaman` (pagination opsional).
- Test: update user, validasi role, karakterisasi `POST /pemanggilan` dan `GET /pemanggilan/aktif`, unit test `DendaHarianTest` dan `PemanggilanServiceTest` (Mockery), serta test pagination.
- Dokumen di `docs/`: `analisis-tools.md`, `analisis-skalabilitas.md`, `analisis-library.md`, `analisis-ux.md`, `migrasi-teknologi.md`, `multimedia.md`, `log-debugging.md`.

### Diubah
- Logika pinjam/lepas dipindah dari controller ke `PemanggilanService`. Perhitungan denda dan badge yang sebelumnya terduplikasi di `PemanggilanController`, `AdminPemanggilanController`, `AdminDashboardController`, `RiwayatController`, dan `AdminBukuCatatanGaibController` kini memakai satu sumber. Respons API tidak berubah (`d1ee6b1`).
- `role` wajib diisi dan hanya boleh `admin` atau `pengamal` saat admin menambah user; sebelumnya tidak divalidasi (`b854fd9`).
- Penyebutan versi di README dan `docs/` diperbaiki menjadi Laravel 13.x dan PHP ^8.3 (`b854fd9`).

### Diperbaiki
- Kartu akun demo di halaman login memakai email yang tidak ada di seeder (`admin@demo.test`, `pengamal@demo.test`). Diganti ke `admin@example.com` dan `raka@khodamku.test`.

## [1.0.0] - 2026-10-25

Kondisi awal proyek sebelum perubahan di atas (commit `e7ef9af`).

### Fitur
- Autentikasi API dengan Laravel Sanctum: register, login, logout, reset kata sandi.
- Dua peran: admin (Juru Kunci) dan pengamal; route admin dilindungi middleware `role:admin`.
- Profil 1:1 per user, dapat diubah sendiri.
- Katalog khodam dengan pencarian, filter kategori, dan filter ketersediaan.
- Pemanggilan khodam: maksimal 2 aktif per pengamal, jatuh tempo 5 hari, denda Rp5.000 per hari terlambat.
- Pelepasan khodam oleh admin dengan perhitungan mahar denda.
- Admin: dashboard statistik, daftar pemanggilan aktif per tab, Buku Catatan Gaib dengan filter dan cetak.
- Admin: CRUD khodam (dengan upload foto di backend), CRUD kategori, tambah/lihat/hapus user.
- Frontend Next.js untuk halaman admin, login, profil, dan halaman pengamal.
- CI GitHub Actions dengan PHP 8.3 dan SQLite.
