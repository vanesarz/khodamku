# KhodamKu

### *Sewa Khodam, Hidup Lebih Tenang.*

KhodamKu adalah aplikasi web sistem informasi peminjaman dan persewaan unit yang dikemas dengan tema unik peminjaman entitas "khodam" bertuah dan sentuhan humor mistis modern. Aplikasi ini dibangun secara *full-stack* memisahkan backend RESTful API (Laravel) dan frontend SPA modern (Next.js & Tailwind CSS) dengan memenuhi seluruh 19 butir ketentuan spesifikasi proyek sertifikasi Web Developer.

> **Disclaimer:** Seluruh nama entitas khodam, deskripsi mistis, kategori, dan cerita latar dalam aplikasi ini bersifat fiktif semata dan ditujukan untuk sarana pembelajaran serta hiburan.

---

## 📋 Informasi Proyek & Identitas

| Atribut | Keterangan |
| :--- | :--- |
| **Nama Kelompok** | **Kelompok 11** |
| **Nama Project** | **KhodamKu** (*Sewa Khodam, Hidup Lebih Tenang*) |
| **Kategori Aplikasi** | Web Application Decoupled (REST API + Single Page Application) |
| **Teknologi Backend** | PHP 8.2+, Laravel 11, Laravel Sanctum, MySQL / MariaDB |
| **Teknologi Frontend**| Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS & Tailwind CSS |

### 👥 Nama Team

| No. | Nama Anggota | NIM | 
| :--: | :--- | :---: | 
| 1 | **Vanesa Rizka Alfatihah** | `102022300121` | 
| 2 | **Taufik Qurohman** | `102022300211` | 
| 3 | **Ahmad Akmal Amran** | `102022300010` | 

---

## 🔮 Kamus Istilah & Pemetaan Konteks Bisnis

Sistem peminjaman unit konvensional diadaptasi ke dalam semantik tematik KhodamKu sebagai berikut:

| Konsep Umum (Spesifikasi Soal) | Padanan Konteks KhodamKu | Definisi & Penjelasan Teknis |
| :--- | :--- | :--- |
| **Unit** | **Khodam** | Entitas pelindung/khodam yang disewakan (memiliki kode unik, nama, level kekuatan, dan foto). |
| **User (Anggota)** | **Pengamal** | Pengguna terdaftar yang menyewa/meminjam khodam untuk kebutuhan pribadi. |
| **Admin** | **Juru Kunci** | Pengelola padepokan yang memegang otorisasi master data, pelepasan unit, dan laporan. |
| **Kategori Unit** | **Kategori Khodam** | Klasifikasi tuah/manfaat khodam (contoh: *Penjaga Rumah*, *Penglaris Dagangan*, dll.). |
| **Peminjaman / Sewa** | **Pemanggilan** | Proses transaksi pengikatan khodam ke raga pengamal dengan durasi maksimal 5 hari. |
| **Pengembalian Unit** | **Pelepasan** | Proses pelepasan ikatan khodam dari raga pengamal yang diproses oleh Juru Kunci. |
| **Denda Keterlambatan** | **Mahar Keterlambatan** | Biaya denda kompensasi yang wajib dibayarkan jika melewati tanggal jatuh tempo kontrak. |

---

## 🌟 List Fitur (Kesesuaian Ketentuan Proyek)

Berikut adalah daftar fitur utama KhodamKu yang mencakup seluruh poin persyaratan:

### 1. Hak Akses & Dua Jenis Anggota (Admin & User/Anggota)
- **Juru Kunci (Admin):** Memiliki hak penuh untuk mengelola master data khodam, kategori, data anggota/pengamal, memantau seluruh pemanggilan aktif di padepokan, memproses pelepasan khodam, dan mencetak laporan Buku Catatan Gaib.
- **Pengamal (User / Anggota):** Memiliki akses untuk menjelajahi katalog khodam, mengajukan ritual pemanggilan khodam, memantau kontrak aktif dan jatuh tempo pada raganya, serta mengelola profil pribadi.

### 2. Autentikasi Wajib Sebelum Akses Web
- Setiap pengguna wajib melakukan **Login** untuk dapat mengakses fitur web (Dashboard, Katalog, Pemanggilan, Riwayat, dan Profil).
- Autentikasi diamankan menggunakan **Laravel Sanctum Bearer Token** dan cookie sesi aman dengan proteksi route middleware (`auth` dan `role`).
- Pengguna yang belum terautentikasi otomatis diarahkan ke halaman login.

### 3. Keharusan Terdaftar Sebagai Anggota untuk Sewa / Panggil Unit
- Pemanggilan unit khodam hanya dapat dilakukan oleh pengguna yang berstatus sebagai anggota terdaftar (*Pengamal*).
- Calon anggota dapat melakukan registrasi mandiri melalui formulir pendaftaran atau didaftarkan langsung oleh Juru Kunci.

### 4. Relasi Satu User Tepat Memiliki Satu Profil (1 : 1)
- Setiap pembuatan akun user (baik via registrasi mandiri, seed database, maupun input admin) secara otomatis membuat data di tabel `profiles`.
- Integritas data dijaga dengan *unique foreign key constraint* (`UNIQUE(user_id)`).

### 5. Pengelolaan & Pembaruan Profil Mandiri
- Setiap user (Juru Kunci maupun Pengamal) dapat melihat dan mengubah profil pribadinya masing-masing di halaman `/profil`.
- Field profil meliputi: Nama lengkap, Nomor HP, Alamat tempat tinggal, Tanggal lahir, Weton Jawa (Legi, Pahing, Pon, Wage, Kliwon), serta Foto profil.

### 6. Multiple Kategori untuk Setiap Unit Khodam
- Relasi **Many-to-Many** antara unit khodam dan kategori melalui tabel pivot `kategori_khodam`.
- Satu unit khodam dapat memiliki lebih dari satu kategori tuah sekaligus (misal: *Macan Putih* memiliki kategori *Penjaga Rumah* dan *Kewibawaan*).

### 7. Duplikasi Nama Unit Diperbolehkan dengan Kode Unit Unik
- Nama unit khodam dapat berjumlah lebih dari 1 (nama boleh sama), namun wajib dibedakan melalui **kode unit** yang unik (`kode_khodam`).
- *Contoh pada database:*
  - `KHD-MCP-001`: *Macan Putih* (Asal Alas Purwo, Level 4)
  - `KHD-MCP-002`: *Macan Putih* (Asal Gunung Lawu, Level 5)
- Sistem menerapkan validasi `unique:khodams,kode_khodam` pada saat penambahan dan pembaruan data.

### 8. Pencarian Unit Berdasarkan Nama
- Tersedia fitur pencarian interaktif di halaman **Katalog Khodam** dan **Kelola Master Khodam**.
- Pengguna dapat mencari unit berdasarkan nama khodam, kode unit, maupun asal daerah secara *real-time*.

### 9. Manajemen Master Data Lengkap oleh Admin (CRUD)
Juru Kunci dapat melakukan operasi Tambah (Create), Lihat (Read), Ubah (Update), dan Hapus (Delete) pada:
- **Data Unit (Khodam):** Nama, kode unik, asal, level kekuatan (1–5), deskripsi, kategori tuah, dan upload foto.
- **Data Kategori:** Nama kategori unik dan deskripsi manfaat. Dilengkapi proteksi integritas: kategori tidak dapat dihapus jika masih digunakan oleh unit khodam aktif.
- **Data User / Anggota:** Nama, email, password, nomor HP, dan alamat.

### 10. Pembatasan Kuota Sewa Maksimal 2 Unit per Anggota
- Raga seorang Pengamal dibatasi secara ketat hanya dapat menampung **maksimal 2 unit khodam aktif** dalam satu kurun waktu.
- Sistem otomatis memvalidasi kuota sebelum pemanggilan. Jika kuota telah mencapai 2 unit, sistem akan menolak pemanggilan baru hingga salah satu khodam dilepaskan.

### 11. Batas Durasi Sewa 5 Hari & Denda Keterlambatan Otomatis
- Durasi standar peminjaman/pemanggilan adalah **maksimal 5 hari**.
- Tanggal jatuh tempo dihitung otomatis: `tgl_panggil + 5 hari`.
- Jika pengembalian/pelepasan melewati tanggal jatuh tempo, sistem secara otomatis menghitung mahar denda keterlambatan flat sebesar **Rp5.000 per hari untuk setiap unit**:
  $$\text{Denda} = \text{Hari Terlambat} \times \text{Rp5.000}$$

### 12. Pengembalian Unit Khusus Diproses oleh Admin
- Anggota (Pengamal) **tidak dapat** melepaskan atau mengembalikan khodam sendiri secara sepihak.
- Pengamal wajib melapor / menghubungi Juru Kunci (tersedia tombol hubungi cepat).
- Juru Kunci memproses pelepasan melalui dialog konfirmasi resmi, di mana sistem menghitung status keterlambatan dan mahar denda secara transparan.

### 13. Admin Memantau Seluruh List Unit yang Sedang Dipinjam
- Halaman **Pemanggilan Aktif Juru Kunci** (`/admin/pemanggilan`) menyajikan daftar seluruh khodam yang sedang bersemayam di semua pengamal.
- Dilengkapi tab navigasi cepat: **Semua**, **Terlambat** (highlight amber & badge durasi telat), dan **Masih Berjalan**.

### 14. User Hanya Melihat Unit yang Dipinjam oleh Dirinya Sendiri
- Halaman **Dashboard Pengamal** (`/dashboard`) dan **Pemanggilan Saya** (`/pemanggilan`) menerapkan isolasi data ketat berbasis akun yang sedang login.
- Pengamal hanya dapat memantau status khodam miliknya sendiri beserta sisa durasi sewa dan slot raga (`0/2`, `1/2`, atau `2/2`).

### 15. Pelaporan & Pencetakan Riwayat Transaksi oleh Admin
- Halaman **Buku Catatan Gaib** (`/admin/buku-catatan-gaib`) mencatat seluruh riwayat peminjaman (baik yang masih aktif, terlambat, maupun telah dilepaskan).
- Dilengkapi filter pencarian berdasarkan nama pengamal, status kontrak, serta rentang tanggal panggil.
- Dilengkapi tombol **Cetak Catatan** untuk mencetak laporan riwayat peminjaman ke format dokumen fisik / PDF siap cetak.

### 16. Validasi Input Field yang Dirasa Perlu (`required`)
- Seluruh formulir input menerapkan validasi ketat di sisi backend (Laravel Form Request) dan frontend:
  - `name`, `email`, `password`: Wajib diisi (*required*).
  - `kode_khodam`: Wajib diisi, unik (*required, unique*).
  - `nama`, `asal`, `level_kekuatan`: Wajib diisi (*required, integer 1–5*).
  - `kategori_ids`: Wajib memilih minimal satu kategori (*required, array*).
  - `khodam_id`, `durasi_hari`: Wajib dipilih pada saat pemanggilan (*required*).

---

## 🗄️ Screen Capture Skema Project Database (ERD)

Berikut adalah diagram relasi entitas (*Entity Relationship Diagram*) resmi dari basis data KhodamKu:

![Skema Database KhodamKu](docs/ERD.png)

### Rincian Relasi Antar Entitas:
1. **`users` 1 : 1 `profiles`**
   - Setiap pengguna memiliki tepat satu data profil (`profiles.user_id` bersifat `UNIQUE` dengan *foreign key cascade delete*).
2. **`users` 1 : N `pemanggilans`**
   - Satu pengguna pengamal dapat memiliki banyak riwayat transaksi pemanggilan khodam.
3. **`khodams` 1 : N `pemanggilans`**
   - Satu unit khodam dapat tercatat dalam banyak riwayat transaksi pemanggilan sepanjang waktu.
4. **`khodams` N : M `kategoris`**
   - Relasi banyak-ke-banyak antara khodam dan kategori yang dihubungkan melalui tabel pivot `kategori_khodam`.

---

## 🎥 Screen Recorder Demo Penjelasan Website

Berikut adalah rekaman demonstrasi alur kerja dan penjelasan fitur lengkap website KhodamKu:

> 🎬 **Tautan Video Demo:** [Tonton Video Demo Penjelasan KhodamKu di Google Drive / YouTube](https://youtu.be/demo-khodamku-kelompok11)  
> *(Catatan: Rekaman mencakup login multi-role, katalog & pencarian, ritual pemanggilan, batas kuota 2 unit, hitung denda otomatis, pelepasan oleh Juru Kunci, serta pencetakan Buku Catatan Gaib).*

---

## 🏗️ Tabel Migration Database

Skema basis data dibangun menggunakan Laravel Migration yang rapi dan terstandarisasi:

### 1. Tabel `users` (`0001_01_01_000000_create_users_table.php`)
Menyimpan kredensial autentikasi dan peran akun pengguna.
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->enum('role', ['admin', 'pengamal'])->default('pengamal');
    $table->rememberToken();
    $table->timestamps();
});
```

### 2. Tabel `profiles` (`2026_10_23_094733_create_profiles_table.php`)
Menyimpan data identitas personal pengguna (relasi 1:1 dengan `users`).
```php
Schema::create('profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
    $table->string('no_hp')->nullable();
    $table->text('alamat')->nullable();
    $table->date('tanggal_lahir')->nullable();
    $table->string('weton')->nullable();
    $table->string('foto')->nullable();
    $table->timestamps();
});
```

### 3. Tabel `kategoris` (`2026_10_23_094712_create_kategoris_table.php`)
Menyimpan daftar master kategori tuah khodam.
```php
Schema::create('kategoris', function (Blueprint $table) {
    $table->id();
    $table->string('nama')->unique();
    $table->text('deskripsi')->nullable();
    $table->timestamps();
});
```

### 4. Tabel `khodams` (`2026_10_23_094727_create_khodams_table.php`)
Menyimpan daftar unit khodam dengan kode unit unik dan dukungan duplikasi nama unit.
```php
Schema::create('khodams', function (Blueprint $table) {
    $table->id();
    $table->string('kode_khodam')->unique();
    $table->string('nama');
    $table->string('asal');
    $table->tinyInteger('level_kekuatan')->default(1);
    $table->text('deskripsi')->nullable();
    $table->string('foto')->nullable();
    $table->timestamps();
});
```

### 5. Tabel Pivot `kategori_khodam` (`2026_10_23_094738_create_kategori_khodam_table.php`)
Menghubungkan unit khodam dengan multiple kategori (relasi N:M).
```php
Schema::create('kategori_khodam', function (Blueprint $table) {
    $table->id();
    $table->foreignId('khodam_id')->constrained('khodams')->onDelete('cascade');
    $table->foreignId('kategori_id')->constrained('kategoris')->onDelete('cascade');
    $table->unique(['khodam_id', 'kategori_id']);
    $table->timestamps();
});
```

### 6. Tabel `pemanggilans` (`2026_10_23_094743_create_pemanggilans_table.php`)
Menyimpan transaksi peminjaman/pemanggilan, batas waktu jatuh tempo, tanggal pelepasan, dan denda mahar.
```php
Schema::create('pemanggilans', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('khodam_id')->constrained('khodams')->onDelete('cascade');
    $table->date('tgl_panggil');
    $table->date('tgl_jatuh_tempo');
    $table->date('tgl_pelepasan')->nullable();
    $table->decimal('mahar', 10, 2)->default(0);
    $table->enum('status', ['aktif', 'dilepas'])->default('aktif');
    $table->timestamps();
});
```

---

## 🌱 Data Seed Awal Project

Aplikasi telah dilengkapi seeder komprehensif (`php artisan db:seed`) untuk memenuhi kebutuhan inisialisasi awal pengujian:

1. **User Juru Kunci (Admin):**
   - Akun: `admin@example.com` / `password123`
   - Profil: Kantor Pusat KhodamKu, Weton Wage.
2. **User Pengamal (Anggota):**
   - **Sekar Ayu Lestari** (`sekar@khodamku.test` / `password123`)
   - **Bima Saputra** (`bima@khodamku.test` / `password123`)
   - **Raka Pratama** (`raka@khodamku.test` / `password123`)
3. **Master Kategori Khodam:**
   - *Penjaga Rumah*, *Penglaris Dagangan*, *Pelindung Ujian*, *Kewibawaan*, *Penolak Bala*, *Pencari Jodoh*.
4. **Master Unit Khodam (8 Unit):**
   - `KHD-MCP-001`: Macan Putih (Alas Purwo, Banyuwangi)
   - `KHD-MCP-002`: Macan Putih (Gunung Lawu, Karanganyar)
   - `KHD-HRM-001`: Harimau Sumatra (Bukit Barisan)
   - `KHD-KBJ-001`: Kakek Berjubah Putih (Pertapaan Kendalisada)
   - `KHD-NGH-001`: Naga Hijau (Telaga Sarangan)
   - `KHD-KCO-001`: Kucing Oren Barbar (Gang Kelinci)
   - `KHD-KDP-001`: Kulkas Dua Pintu (Pasar Glodok)
   - `KHD-TPN-001`: Tutup Panci (Dapur Mbok Darmi)
5. **Data Awal Transaksi Peminjaman:**
   - Menyiapkan skenario kontrak berstatus **Aktif (Berjalan)**, **Jatuh Tempo Hari Ini**, **Terlambat Melewati Tempo** (menghasilkan mahar denda), serta kontrak yang sudah **Dilepas**.

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Persyaratan Sistem
- PHP `>= 8.2` & Composer `>= 2.8`
- Node.js `>= 18.x` & npm
- MySQL Server / MariaDB

### 2. Menjalankan Backend (Laravel REST API)
```bash
# 1. Masuk ke direktori root repository
cd khodamku

# 2. Pasang dependensi PHP
composer install

# 3. Siapkan file konfigurasi environment
cp .env.example .env
php artisan key:generate

# 4. Konfigurasikan koneksi database di file .env
# DB_DATABASE=khodamku, DB_USERNAME=root, DB_PASSWORD=

# 5. Jalankan migrasi dan seeding data
php artisan migrate:fresh --seed

# 6. Jalankan server Laravel API
php artisan serve
```
> Server backend akan berjalan di `http://127.0.0.1:8000`.

### 3. Menjalankan Frontend (Next.js Application)
```bash
# 1. Masuk ke direktori frontend
cd frontend

# 2. Pasang dependensi Node.js
npm install

# 3. Jalankan server pengembangan Next.js
npm run dev
```
> Antarmuka web dapat diakses melalui peramban di `http://localhost:3000`.

---

## 🔑 Kredensial Akun Pengujian

| Peran Akun | Nama Pengguna | Alamat Email | Kata Sandi | Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Juru Kunci (Admin)** | Mbah Darmo | `admin@example.com` | `password123` | Dashboard Juru Kunci, Kelola Master, Pelepasan, Cetak Catatan |
| **Pengamal 1 (User)** | Sekar Ayu Lestari | `sekar@khodamku.test` | `password123` | Dashboard Pengamal, Katalog Khodam, Pemanggilan Saya |
| **Pengamal 2 (User)** | Bima Saputra | `bima@khodamku.test` | `password123` | Dashboard Pengamal, 2 Slot Raga Penuh, Pantau Kontrak |
| **Pengamal 3 (User)** | Raka Pratama | `raka@khodamku.test` | `password123` | Dashboard Pengamal, Riwayat Pelepasan, Profil Pribadi |

---

## 📄 Lisensi & Hak Cipta

Proyek ini dikembangkan secara eksklusif oleh **Kelompok 11** untuk memenuhi tugas akhir pelatihan dan sertifikasi pengembang web (*Web Developer Certification*). Seluruh konten mistis bersifat fiktif.
