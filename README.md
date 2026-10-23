# KhodamKu
### Sewa Khodam, Hidup Lebih Tenang.

KhodamKu adalah aplikasi web bertema peminjaman khodam fiktif yang dikemas dengan antarmuka modern dan sentuhan humor mistis. Aplikasi ini dibangun untuk memenuhi ketentuan proyek sertifikasi Web Developer, dengan fitur pengelolaan master data khodam, pemanggilan (peminjaman), pelepasan (pengembalian), penghitungan mahar keterlambatan otomatis, serta pencatatan riwayat transaksi.

> **Catatan:** Seluruh entitas, deskripsi, dan kategori khodam dalam aplikasi ini bersifat fiktif semata dan ditujukan untuk sarana pembelajaran serta hiburan.

---

## Identitas Proyek

| Informasi | Keterangan |
|---|---|
| Nama Kelompok | `KhodamKu` |
| Nama Project | **KhodamKu** |
| Tagline | *Sewa khodam, hidup lebih tenang.* |
| Jenis Aplikasi | Web App Decoupled (RESTful API & SPA Frontend) |

## Anggota Tim

| No. | Nama Anggota | NIM |
|---:|---|---|
| 1 | `Vanesa Rizka Alfatihah` | `102022300121` |
| 2 | `Taufik Qurohman` | `102022300211` |
| 3 | `Ahmad Akmal Amran` | `102022300010` |

---

## Daftar Fitur

### 1. Autentikasi dan Otorisasi (REST API)
- Registrasi akun mandiri khusus peran **Pengamal**.
- Login berbasis token **Laravel Sanctum (Bearer Token)** tanpa kendala session/CSRF cookies.
- Pembuatan akun Juru Kunci/Admin baru oleh Juru Kunci aktif melalui endpoint terproteksi.
- Pembatasan hak akses berbasis peran menggunakan middleware (`admin`/`juru_kunci` dan `pengamal`).
- Logout terpusat dengan penghapusan token aktif (`personal_access_tokens`).

### 2. Profil Pengguna Otomatis (BR-08)
- Setiap pembuatan akun baru (registrasi mandiri, admin seeder, atau input admin) secara otomatis membuat data di tabel `profiles` via transaksi database.
- Pengguna dapat melihat dan memperbarui profil pribadinya (nomor HP, alamat, weton, tanggal lahir, dan foto).

### 3. Katalog Khodam
- Menampilkan daftar khodam beserta status ketersediaannya (*Menunggu Dipanggil* atau *Sedang Bersemayam*).
- Pencarian khodam berdasarkan nama.
- Filter khodam berdasarkan kategori.
- Detail khodam mencakup kode unik, nama, asal daerah, level kekuatan (1–5), deskripsi, dan kategori.
- Mendukung entitas dengan nama sama selama kode unik khodam berbeda.

### 4. Manajemen Master Data (Juru Kunci)
- Tambah, ubah, lihat, dan hapus master data khodam beserta foto.
- Manajemen kategori khodam.
- Relasi fleksibel: satu khodam dapat terhubung ke lebih dari satu kategori (*many-to-many*).
- Manajemen data Pengamal dan admin baru.

### 5. Pemanggilan Khodam (Peminjaman)
- Pengamal terdaftar dapat mengajukan pemanggilan unit yang berstatus tersedia.
- Batasan ketat: Pengamal maksimal memiliki **2 pemanggilan aktif** secara bersamaan.
- Satu unit khodam hanya dapat bersemayam pada satu Pengamal dalam satu kurun waktu.
- Penentuan tanggal jatuh tempo otomatis selama **5 hari** sejak pemanggilan.

### 6. Pelepasan Khodam & Mahar Keterlambatan (Pengembalian)
- Pelepasan hanya diproses oleh Juru Kunci setelah Pengamal melapor/menghubungi.
- Perhitungan otomatis mahar keterlambatan jika melewati masa kontrak gaib (jatuh tempo).
- Tarif keterlambatan ditetapkan **Rp5.000 per hari untuk setiap unit**.

### 7. Dashboard & Buku Catatan Gaib (Laporan)
- Dashboard Juru Kunci: ringkasan statistik, monitoring seluruh khodam yang sedang dipanggil, serta pencetakan riwayat (Buku Catatan Gaib).
- Dashboard Pengamal: memantau status khodam milik sendiri, sisa durasi kontrak, serta estimasi mahar.

---

## Arsitektur & Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Backend API** | PHP 8.2+, Laravel 11 | RESTful API, Routing prefix `api/v1` |
| **Authentication**| Laravel Breeze (API mode), Sanctum | Bearer Token Auth |
| **Database** | MySQL 8.x / MariaDB | Relasional (InnoDb, Foreign Key Cascade) |
| **Frontend** | Next.js / React, Tailwind CSS | Single Page Application / Decoupled Client |
| **API Client Test**| Postman / Thunder Client | Dokumentasi dan pengujian endpoint |
| **Reporting** | Dompdf / Native Browser Print | Cetak Buku Catatan Gaib |

---

## Struktur Basis Data

Basis data inti KhodamKu tersusun atas 6 tabel utama:

| Tabel | Keterangan & Kolom Utama |
|---|---|
| `users` | Akun pengguna (`id`, `name`, `email`, `password`, `role: ['admin', 'pengamal']`) |
| `profiles` | Profil pengguna (`id`, `user_id`, `no_hp`, `alamat`, `tanggal_lahir`, `weton`, `foto`) |
| `kategoris` | Master kategori (`id`, `nama`, `deskripsi`) |
| `khodams` | Master unit khodam (`id`, `kode_khodam`, `nama`, `asal`, `level_kekuatan`, `deskripsi`, `foto`) |
| `kategori_khodam` | Pivot table relasi many-to-many (`khodam_id`, `kategori_id`) |
| `pemanggilans` | Transaksi (`id`, `user_id`, `khodam_id`, `tgl_panggil`, `tgl_jatuh_tempo`, `tgl_pelepasan`, `mahar`, `status`) |

### Relasi Antar Entitas
- `users` **1 : 1** `profiles` (Setiap user tepat memiliki satu profil bawaan)
- `users` **1 : N** `pemanggilans` (Satu pengamal memiliki banyak riwayat transaksi)
- `khodams` **1 : N** `pemanggilans` (Satu khodam memiliki banyak riwayat pemanggilan)
- `khodams` **N : M** `kategoris` (Dihubungkan melalui tabel pivot `kategori_khodam`)

### Diagram ERD

![Skema Database KhodamKu](docs/database-schema.png)

---

## Daftar Endpoint Utama (API v1)

Base URL: `http://localhost:8000/api/v1`
> **Catatan:** Akan diperbarui jika API lain sudah siap.

| Method | Endpoint | Hak Akses | Keterangan |
|---|---|---|---|
| `POST` | `/register` | Publik | Registrasi Pengamal baru (otomatis buat profil) |
| `POST` | `/login` | Publik | Autentikasi dan perolehan Bearer Token |
| `POST` | `/logout` | Authenticated | Cabut token aktif |
| `GET` | `/user` | Authenticated | Menampilkan data user & role yang login |
| `POST` | `/admin/users` | `auth:sanctum`, `role:admin` | Pembuatan akun admin baru oleh admin aktif |

---

## Instalasi & Menjalankan Proyek

### 1. Persyaratan Lingkungan
- PHP `>= 8.2`
- Composer `>= 2.8`
- Node.js `>= 18.x` & npm
- MySQL Server

### 2. Kloning Repository & Instalasi Backend

```bash
# Clone repository
git clone <URL_REPOSITORY_GITLAB>
cd khodamku

# Pasang dependensi backend
composer install

# Salin konfigurasi environment
cp .env.example .env
php artisan key:generate
```

### 3. Konfigurasi Database (.env)

Sesuaikan pengaturan koneksi database lokal pada file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=khodamku
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrasi & Seeding Data Awal

Jalankan perintah ini untuk membersihkan tabel, membangun skema, dan mengisi data akun default serta master katalog:

```bash
php artisan migrate:fresh --seed
```

### 5. Konfigurasi Frontend

```bash
npm install
npm run dev
```

### 6. Jalankan Server API Backend

```bash
php artisan serve
```

Server backend akan aktif di `http://127.0.0.1:8000`.

---

## Akun Demo & Pengujian

Kredensial bawaan yang disiapkan oleh `DatabaseSeeder` (`AdminUserSeeder`):

| Peran | Email | Kata Sandi | Deskripsi |
|---|---|---|---|
| **Juru Kunci (Admin)** | `admin@khodamku.test` | `password123` | Akses manajemen penuh, konfirmasi lepas, laporan |
| **Pengamal (Member)** | `pengamal@khodamku.test` | `password123` | Akses katalog, panggil khodam, pantau status |

---

## Aturan Bisnis Inti (Business Rules)

1. **BR-01:** Raga Pengamal maksimal hanya mampu menampung **2 khodam aktif** dalam satu waktu.
2. **BR-02:** Satu unit khodam tidak dapat dipanggil Pengamal lain jika statusnya masih bersemayam.
3. **BR-03:** Kontrak gaib (durasi peminjaman) berlaku selama **5 hari** kalender.
4. **BR-04:** Keterlambatan pelepasan dikenakan mahar keterlambatan: `hari_terlambat × Rp5.000`.
5. **BR-05:** Tarif mahar keterlambatan standar bernilai flat **Rp5.000 per hari per unit**.
6. **BR-06:** Pelepasan unit khodam hanya sah jika diproses oleh Juru Kunci.
7. **BR-07:** Kode khodam wajib unik, namun nama entitas khodam diperbolehkan sama.
8. **BR-08:** Setiap akun pengguna wajib otomatis memiliki tepat satu relasi profil sejak pendaftaran.

---

## Tautan Dokumen Pendukung

- **Dokumen Kebutuhan (BRD):** `docs/BRD-KhodamKu.pdf`
- **Product Requirements Document (PRD):** `docs/PRD-KhodamKu.pdf`
- **Video Demonstrasi Aplikasi:** `[Tambahkan link Google Drive / YouTube demo]`

---

## Lisensi

Proyek ini dikembangkan secara eksklusif untuk kepentingan uji kompetensi dan sertifikasi Web Developer. Seluruh materi bersifat fiktif.
