# BUKU PANDUAN PENGGUNA (MANUAL BOOK)
# KhodamKu: Sewa Khodam, Hidup Lebih Tenang

---

## 📖 DAFTAR ISI

1. [PENDAHULUAN](#1-pendahuluan)
   - 1.1 [Tentang Aplikasi KhodamKu](#11-tentang-aplikasi-khodamku)
   - 1.2 [Kamus Istilah & Konteks Tematik](#12-kamus-istilah--konteks-tematik)
   - 1.3 [Pembagian Peran Pengguna (Roles)](#13-pembagian-peran-pengguna-roles)
2. [MEMULAI & PERSYARATAN SISTEM](#2-memulai--persyaratan-sistem)
   - 2.1 [Persyaratan Perangkat & Peramban](#21-persyaratan-perangkat--peramban)
   - 2.2 [Alamat Akses Aplikasi](#22-alamat-akses-aplikasi)
   - 2.3 [Daftar Akun Bawaan (Demo Credentials)](#23-daftar-akun-bawaan-demo-credentials)
3. [PANDUAN PENGGUNA: PENGAMAL (ANGGOTA)](#3-panduan-pengguna-pengamal-anggota)
   - 3.1 [Login ke Aplikasi](#31-login-ke-aplikasi)
   - 3.2 [Memahami Dashboard Pengamal](#32-memahami-dashboard-pengamal)
   - 3.3 [Menjelajahi Katalog & Mencari Khodam](#33-menjelajahi-katalog--mencari-khodam)
   - 3.4 [Melakukan Ritual Pemanggilan Khodam (Peminjaman)](#34-melakukan-ritual-pemanggilan-khodam-peminjaman)
   - 3.5 [Memantau Kontrak Aktif di Raga](#35-memantau-kontrak-aktif-di-raga)
   - 3.6 [Prosedur Pengembalian Khodam (Pelepasan)](#36-prosedur-pengembalian-khodam-pelepasan)
   - 3.7 [Melihat Riwayat Pemanggilan Pribadi](#37-melihat-riwayat-pemanggilan-pribadi)
   - 3.8 [Mengelola Profil Pribadi & Weton](#38-mengelola-profil-pribadi--weton)
4. [PANDUAN PENGGUNA: JURU KUNCI (ADMINISTRATOR)](#4-panduan-pengguna-juru-kunci-administrator)
   - 4.1 [Login Administrator & Dashboard Padepokan](#41-login-administrator--dashboard-padepokan)
   - 4.2 [Kelola Master Data Khodam (CRUD Unit)](#42-kelola-master-data-khodam-crud-unit)
   - 4.3 [Kelola Master Data Kategori (CRUD Kategori)](#43-kelola-master-data-kategori-crud-kategori)
   - 4.4 [Kelola Master Data Pengamal (CRUD User)](#44-kelola-master-data-pengamal-crud-user)
   - 4.5 [Memantau Seluruh Pemanggilan Aktif Padepokan](#45-memantau-seluruh-pemanggilan-aktif-padepokan)
   - 4.6 [Memproses Pelepasan Khodam & Perhitungan Denda](#46-memproses-pelepasan-khodam--perhitungan-denda)
   - 4.7 [Buku Catatan Gaib & Pencetakan Laporan](#47-buku-catatan-gaib--pencetakan-laporan)
   - 4.8 [Mengelola Profil Juru Kunci](#48-mengelola-profil-juru-kunci)
5. [TANYA JAWAB (FAQ) & PANDUAN PENANGANAN KENDALA](#5-tanya-jawab-faq--panduan-penanganan-kendala)

---

# 1. Pendahuluan

## 1.1 Tentang Aplikasi KhodamKu

**KhodamKu** (*Sewa Khodam, Hidup Lebih Tenang*) adalah sistem informasi peminjaman dan inventaris unit berbasis web modern yang dikemas dengan nuansa mistis-komedi Indonesia. Sistem ini mengadopsi mekanisme operasional peminjaman unit standar—seperti registrasi anggota, katalogisasi barang, batas pinjam, durasi peminjaman, denda keterlambatan, dan pencetakan riwayat transaksi—namun dibalut dengan terminologi unik seperti "khodam", "ritual pemanggilan", "pelepasan", dan "mahar keterlambatan".

Aplikasi dibangun menggunakan arsitektur *decoupled full-stack*:
- **Backend API:** Framework Laravel 13.x dengan PHP ^8.3 dan basis data MySQL.
- **Frontend SPA:** Framework Next.js 16 (App Router), React 19, TypeScript, dan Tailwind CSS.

> ⚠️ **Catatan Penting:** Seluruh nama entitas khodam, kategori tuah, dan visualisasi bersifat **FIKTIF** semata dan ditujukan untuk sarana pembelajaran rekayasa perangkat lunak serta hiburan.

---

## 1.2 Kamus Istilah & Konteks Tematik

Untuk memudahkan pemahaman alur sistem, berikut adalah pemetaan istilah sistem umum ke dalam istilah tematik KhodamKu:

| Istilah Sistem Umum | Istilah KhodamKu | Definisi & Penjelasan Teknis |
| :--- | :--- | :--- |
| **Unit / Item Barang** | **Khodam** | Entitas pelindung bertuah yang disewakan (memiliki kode unik, nama, level kekuatan 1–5, dan kategori). |
| **User / Anggota** | **Pengamal** | Pengguna terdaftar yang menyewa/meminjam khodam untuk kebutuhan pribadi. |
| **Administrator** | **Juru Kunci** | Pengelola padepokan yang memegang otorisasi master data, pelepasan unit, dan laporan. |
| **Kategori Barang** | **Kategori Tuah** | Klasifikasi manfaat khodam (contoh: *Penjaga Rumah*, *Penglaris Dagangan*, *Kewibawaan*). |
| **Peminjaman / Sewa** | **Pemanggilan** | Proses transaksi pengikatan khodam ke raga pengamal dengan durasi maksimal 5 hari kalender. |
| **Pengembalian Barang** | **Pelepasan** | Proses pelepasan ikatan khodam dari raga pengamal yang **wajib diproses oleh Juru Kunci**. |
| **Denda Keterlambatan** | **Mahar Keterlambatan** | Biaya denda kompensasi keterlambatan flat sebesar **Rp5.000 per hari** untuk setiap khodam. |
| **Kapasitas Sewa User** | **Kekuatan Raga** | Batasan biologis-sistem: **Satu Pengamal maksimal hanya boleh meminjam 2 khodam aktif**. |
| **Buku Besar / Riwayat** | **Buku Catatan Gaib** | Rekapitulasi seluruh riwayat transaksi peminjaman lengkap dengan fitur filter dan cetak laporan. |

---

## 1.3 Pembagian Peran Pengguna (Roles)

Sistem menerapkan pembatasan hak akses berbasis peran (*Role-Based Access Control*):

1. **Juru Kunci (Admin):**
   - Mengelola master data Khodam (Tambah, Lihat, Ubah, Hapus).
   - Mengelola master data Kategori tuah.
   - Mengelola master data Pengamal (Akun Anggota).
   - Memantau seluruh pemanggilan khodam yang sedang aktif di padepokan.
   - Memproses pelepasan khodam dan menghitung mahar keterlambatan secara transparan.
   - Mengakses Buku Catatan Gaib dan mencetak dokumen laporan riwayat peminjaman.
   - Mengelola profil pribadi.

2. **Pengamal (User / Anggota):**
   - Mengakses katalog khodam, melakukan pencarian, dan memfilter berdasarkan kategori.
   - Melakukan ritual pemanggilan khodam (maksimal 2 khodam aktif per akun).
   - Memantau sisa masa sewa khodam yang sedang bersemayam di raganya.
   - Menghubungi Juru Kunci untuk keperluan pengembalian khodam.
   - Melihat riwayat pemanggilan pribadi.
   - Mengelola profil pribadi (identitas, alamat, nomor HP, weton Jawa, dan foto).

---

# 2. Memulai & Persyaratan Sistem

## 2.1 Persyaratan Perangkat & Peramban

Aplikasi KhodamKu dirancang sepenuhnya responsif (*Mobile-First Responsive Web Design*):
- **Perangkat yang Didukung:** Komputer Desktop, Laptop, Tablet, dan Ponsel Pintar (Smartphone).
- **Peramban Web yang Direkomendasikan:**
  - Google Chrome (versi 110 ke atas)
  - Mozilla Firefox (versi 115 ke atas)
  - Apple Safari (versi 16 ke atas)
  - Microsoft Edge (versi 110 ke atas)
- **Persyaratan Koneksi:** Terhubung ke jaringan intranet / internet lokal di mana backend Laravel (`localhost:8000`) dan frontend Next.js (`localhost:3000`) berjalan.

## 2.2 Alamat Akses Aplikasi

- **Halaman Utama (Landing Page):** `http://localhost:3000/`
- **Halaman Masuk (Login):** `http://localhost:3000/login`
- **Dashboard Juru Kunci (Admin):** `http://localhost:3000/admin/dashboard`
- **Dashboard Pengamal (User):** `http://localhost:3000/dashboard`

## 2.3 Daftar Akun Bawaan (Demo Credentials)

Sistem telah dilengkapi dengan data seeder awal untuk demonstrasi:

| Peran (Role) | Nama Pengguna | Alamat Email | Kata Sandi (Password) | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Juru Kunci (Admin)** | Admin 1 (Mbah Darmo) | `admin@khodamku.test` | `password123` | Hak akses penuh admin padepokan |
| **Pengamal (User 1)** | Sekar Ayu Lestari | `sekar@khodamku.test` | `password123` | Anggota dengan 1 pemanggilan aktif |
| **Pengamal (User 2)** | Bima Saputra | `bima@khodamku.test` | `password123` | Anggota dengan status terlambat |
| **Pengamal (User 3)** | Raka Pratama | `raka@khodamku.test` | `password123` | Anggota baru / slot raga masih kosong |

---

# 3. Panduan Pengguna: Pengamal (Anggota)

Bagian ini memandu Pengamal dalam menggunakan fitur-fitur peminjaman khodam.

## 3.1 Login ke Aplikasi

1. Buka peramban web dan arahkan ke alamat `http://localhost:3000/login`.
2. Pada formulir login, masukkan **Alamat Email** dan **Kata Sandi** akun Pengamal kamu.
3. Klik tombol **"Buka Segel & Masuk"**.
4. Sistem akan memverifikasi kredensial. Jika valid, kamu akan otomatis diarahkan ke **Dashboard Pengamal**.

```
+-----------------------------------------------------------+
|                      GERBANG PADEPOKAN                     |
|                                                           |
| Email       : [ sekar@khodamku.test                     ] |
| Kata Sandi  : [ ***********                             ] |
|                                                           |
|             [ 🔮 Buka Segel & Masuk ]                     |
+-----------------------------------------------------------+
```

---

## 3.2 Memahami Dashboard Pengamal

Setelah berhasil masuk, kamu akan disambut di halaman `/dashboard`:
- **Indikator Kapasitas Raga (Slot Bar):** Menunjukkan berapa banyak khodam yang sedang bersemayam di ragamu (misal `1/2 Slot Terisi`). Ingat, batas maksimal raga manusia adalah **2 khodam**.
- **Kartu Khodam yang Sedang Bersemayam:** Menampilkan identitas khodam yang sedang kamu pinjam, tanggal panggil, tanggal jatuh tempo, dan badge durasi sisa masa kontrak.
- **Aksi Cepat:** Tombol pintas untuk menjelajahi katalog khodam atau melihat riwayat pemanggilan.

---

## 3.3 Menjelajahi Katalog & Mencari Khodam

1. Klik menu navigasi **"Katalog Khodam"** di bilah navigasi atas atau samping.
2. Di halaman ini, kamu dapat:
   - **Mencari Berdasarkan Nama:** Ketik nama khodam pada kotak pencarian (misal: "Macan", "Naga", atau "Kulkas").
   - **Filter Berdasarkan Kategori Tuah:** Pilih kategori pada menu filter (misal: *Penjaga Rumah*, *Penglaris Dagangan*, *Kewibawaan*, dll.).
3. Perhatikan **Status Ketersediaan** pada setiap kartu khodam:
   - 🟢 **Badge Hijau (Menunggu Dipanggil):** Khodam bebas dan siap untuk dipinjam.
   - 🟠 **Badge Kuning/Amber (Sedang Bersemayam):** Khodam sedang dipinjam oleh pengamal lain dan tidak dapat dipinjam saat ini.
4. Klik pada kartu khodam untuk membuka jendela **Detail Khodam** guna melihat deskripsi tuah, asal muasal, tingkat level kekuatan (1–5 bintang), dan foto entitas.

---

## 3.4 Melakukan Ritual Pemanggilan Khodam (Peminjaman)

Untuk meminjam khodam yang berstatus **Menunggu Dipanggil**:

1. Buka detail khodam pilihanmu di halaman Katalog.
2. Klik tombol emas **"Lakukan Ritual Pemanggilan"**.
3. Jendela ritual akan muncul:
   - Sistem menetapkan durasi peminjaman standar yaitu **5 Hari**.
   - Sistem menampilkan tanggal panggil (hari ini) dan tanggal jatuh tempo (5 hari ke depan).
4. Klik tombol konfirmasi **"Ikrarkan Pemanggilan"**.
5. Sistem akan memeriksa dua aturan bisnis utama:
   - **Pemeriksaan 1 (Kapasitas Raga):** Apakah kamu sudah memiliki 2 khodam aktif? Jika ya, pemanggilan akan ditolak dengan pesan: *"Batas raga penuh! Ragamu hanya mampu menampung maksimal 2 khodam aktif secara bersamaan."*
   - **Pemeriksaan 2 (Ketersediaan Unit):** Apakah khodam ini baru saja diambil orang lain? Jika ya, sistem akan menolak dengan pesan bahwa khodam sedang bersemayam.
6. Jika kedua syarat terpenuhi, ritual berhasil! Khodam resmi terikat pada ragamu, dan status khodam di katalog berubah menjadi **Sedang Bersemayam**.

---

## 3.5 Memantau Kontrak Aktif di Raga

1. Buka menu **"Pemanggilan Saya"** (`/pemanggilan`).
2. Di halaman ini, kamu dapat melihat semua khodam yang sedang aktif mendampingimu:
   - **Kode Transaksi:** Nomor registrasi pemanggilan gaib (misal `PMG-0002`).
   - **Nama & Kode Khodam:** Identitas spesifik unit khodam.
   - **Tanggal Mulai:** Tanggal ritual pemanggilan dilakukan.
   - **Jatuh Tempo:** Batas akhir khodam harus dilepaskan (5 hari sejak dipanggil).
   - **Status Badge:** Menunjukkan sisa hari (misal *"2 hari lagi"*, *"Hari ini"*, atau tanda merah *"Telat 1 hari"*).
   - **Estimasi Mahar Keterlambatan:** Jika melewati tanggal jatuh tempo, sistem menghitung perkiraan denda sebesar **Rp5.000 per hari keterlambatan**.

---

## 3.6 Prosedur Pengembalian Khodam (Pelepasan)

Sesuai dengan ketentuan padepokan (Ketentuan Soal No. 13):
> **Pengamal TIDAK BISA melepaskan khodam sendiri.** Pelepasan khodam membutuhkan ritual khusus yang hanya berhak dilakukan oleh **Juru Kunci**.

Langkah-langkah pengembalian:
1. Pada kartu khodam di halaman `/pemanggilan`, klik tombol **"Hubungi Juru Kunci"**.
2. Sistem akan membuka tautan WhatsApp resmi padepokan dengan pesan terformat otomatis yang mencantumkan nama kamu, kode transaksi, dan khodam yang ingin dilepaskan.
3. Temui atau hubungi Juru Kunci untuk melunasi mahar keterlambatan (jika ada keterlambatan).
4. Juru Kunci akan memproses pelepasan melalui sistem admin. Begitu dilepaskan, slot ragamu akan kembali kosong dan kamu dapat memanggil khodam baru!

---

## 3.7 Melihat Riwayat Pemanggilan Pribadi

1. Buka menu **"Riwayat"** (`/riwayat`).
2. Halaman ini mencatat seluruh jejak spiritual pemanggilanmu di masa lalu, termasuk tanggal pemanggilan, tanggal pelepasan resmi, serta nominal mahar keterlambatan yang pernah dibayarkan.
3. Halaman ini terisolasi secara ketat—kamu **tidak dapat** melihat catatan milik pengamal lain.

---

## 3.8 Mengelola Profil Pribadi & Weton

1. Buka menu profil di pojok kanan atas atau klik menu **"Profil Saya"** (`/profil`).
2. Kamu dapat memperbarui informasi pribadi berikut:
   - **Nama Lengkap**
   - **Nomor Telepon / WhatsApp**
   - **Alamat Tempat Tinggal**
   - **Tanggal Lahir**
   - **Weton Kelahiran Jawa:** Pilih salah satu weton pasaran (Legi, Pahing, Pon, Wage, atau Kliwon). Weton ini digunakan padepokan untuk mengukur kecocokan energi khodam.
   - **Foto Profil:** Unggah foto profil dalam format JPG/PNG (maksimal 2MB).
3. Klik tombol **"Simpan Perubahan Profil"**. Notifikasi sukses akan muncul menandakan data telah terbarui di basis data.

---

# 4. Panduan Pengguna: Juru Kunci (Administrator)

Bagian ini ditujukan bagi Administrator Padepokan (Juru Kunci) untuk mengelola operasional, master data, pemantauan, pelepasan, dan pelaporan.

## 4.1 Login Administrator & Dashboard Padepokan

1. Masuk melalui halaman `/login` menggunakan akun Juru Kunci (`admin@khodamku.com` / `password123`).
2. Kamu akan langsung diarahkan ke **Dashboard Utama Juru Kunci** (`/admin/dashboard`):
   - **Statistik Padepokan:** Ringkasan Total Entitas Khodam, Khodam Sedang Bersemayam, Khodam Siap Dipanggil, Total Pengamal Terdaftar, dan Transaksi yang Sedang Terlambat.
   - **Tabel Jatuh Tempo Terdekat:** Daftar pemanggilan aktif yang mendekati atau telah melewati batas 5 hari sewa.
   - **Distribusi Tuah Kategori:** Grafik/ringkasan jumlah khodam berdasarkan kategorinya.

---

## 4.2 Kelola Master Data Khodam (CRUD Unit)

Navigasikan ke menu **"Master Data" -> "Kelola Khodam"** (`/admin/kelola/khodam`):

### A. Menambah Khodam Baru:
1. Klik tombol **"+ Tambah Khodam Baru"**.
2. Isi formulir dengan lengkap:
   - **Kode Khodam (Wajib & Unik):** Format standar seperti `KHD-XXX-001`. Sistem menolak jika kode sudah terdaftar.
   - **Nama Khodam (Wajib):** Nama boleh sama dengan khodam lain (misal: "Macan Putih"), karena dibedakan oleh kode unik.
   - **Asal Daerah (Wajib):** Contoh: "Alas Purwo", "Gunung Lawu", "Laut Selatan".
   - **Tingkat Kekuatan (Wajib):** Angka bulat 1 sampai 5.
   - **Kategori Tuah (Wajib):** **Bisa memilih lebih dari 1 kategori sekaligus** (centang beberapa kotak pilihan, misal: *Penjaga Rumah* dan *Kewibawaan*).
   - **Deskripsi Khodam:** Narasi tuah dan pantangan khodam.
   - **Foto Khodam:** Unggah berkas gambar entitas khodam.
3. Klik **"Simpan Entitas"**.

### B. Mengubah Data Khodam:
1. Cari khodam pada tabel kelola khodam.
2. Klik ikon tombol **Edit (Pensil)** pada baris khodam terkait.
3. Ubah atribut yang diinginkan (nama, kategori, level, atau foto).
4. Klik **"Perbarui Data"**.

### C. Menghapus Data Khodam:
1. Klik ikon tombol **Hapus (Tong Sampah)** pada baris khodam.
2. Konfirmasi penghapusan pada dialog yang muncul.
   > ⚠️ **Proteksi Integritas:** Khodam yang sedang bersemayam atau memiliki riwayat pemanggilan terlindungi dari penghapusan fatal.

---

## 4.3 Kelola Master Data Kategori (CRUD Kategori)

Navigasikan ke menu **"Master Data" -> "Kelola Kategori"** (`/admin/kelola/kategori`):
- **Tambah Kategori:** Masukkan nama kategori baru (contoh: *"Penolak Santet"*) beserta deskripsinya, lalu klik **"Simpan Kategori"**.
- **Edit Kategori:** Klik tombol Edit untuk memperbarui nama dan keterangan tuah.
- **Hapus Kategori:** Kategori yang masih digunakan oleh khodam aktif **tidak dapat dihapus sembarangan** untuk mencegah data rusak.

---

## 4.4 Kelola Master Data Pengamal (CRUD User)

Navigasikan ke menu **"Master Data" -> "Kelola Pengamal"** (`/admin/kelola/pengamal`):
- Juru Kunci dapat melihat seluruh daftar anggota padepokan beserta kontak dan weton mereka.
- Juru Kunci dapat mendaftarkan akun pengamal baru secara manual dengan mengisi nama, email, password, no HP, alamat, dan weton.
- Sistem secara otomatis membuatkan 1 data profil relasi (1:1) saat akun pengamal baru dibuat.

---

## 4.5 Memantau Seluruh Pemanggilan Aktif Padepokan

Buka menu **"Pemanggilan Aktif"** (`/admin/pemanggilan`):
1. Halaman ini menyajikan seluruh khodam yang sedang bersemayam di raga pengamal padepokan.
2. Gunakan **Bilah Tab Filter**:
   - **Semua:** Menampilkan seluruh kontrak aktif.
   - **Terlambat:** Menampilkan pemanggilan yang telah melewati tanggal jatuh tempo (ditandai dengan warna merah/amber serta jumlah hari keterlambatannya).
   - **Masih Berjalan:** Menampilkan pemanggilan yang masih dalam batas aman durasi 5 hari.

---

## 4.6 Memproses Pelepasan Khodam & Perhitungan Denda

Ketika Pengamal datang atau melapor untuk mengembalikan khodam:
1. Buka menu `/admin/pemanggilan`.
2. Cari nama pengamal atau kode khodam yang hendak dikembalikan.
3. Klik tombol **"Proses Pelepasan"**.
4. Jendela konfirmasi pelepasan akan muncul dengan rincian:
   - Nama Pengamal & Khodam
   - Tanggal Dipanggil & Tanggal Jatuh Tempo
   - Tanggal Pelepasan (Hari ini)
   - **Perhitungan Keterlambatan Otomatis:**
     - Jika dikembalikan sebelum atau tepat pada tanggal jatuh tempo: **Terlambat 0 Hari, Mahar = Rp0**.
     - Jika melewati jatuh tempo: **Terlambat $N$ Hari, Mahar = $N \times \text{Rp5.000}$**.
5. Klik **"Konfirmasi Pelepasan Khodam"**.
6. Transaksi ditutup, status diperbarui menjadi **Dilepas**, dan khodam otomatis kembali berstatus **Menunggu Dipanggil** di katalog padepokan!

---

## 4.7 Buku Catatan Gaib & Pencetakan Laporan

Buka menu **"Buku Catatan Gaib"** (`/admin/buku-catatan-gaib`):

### A. Menyaring Data Transaksi:
Gunakan 4 panel filter yang tersedia:
1. **Filter Pengamal:** Saring riwayat berdasarkan nama anggota tertentu atau semua anggota.
2. **Filter Status:** Saring berdasarkan status transaksi (*Semua Status*, *Aktif*, *Terlambat*, atau *Dilepas*).
3. **Filter Dari Tanggal:** Batas awal tanggal pemanggilan.
4. **Filter Sampai Tanggal:** Batas akhir tanggal pemanggilan.

### B. Mencetak Laporan Transaksi Fisik / PDF:
1. Setelah data disaring sesuai kebutuhan laporan, klik tombol **"Cetak Laporan"** (ikon printer) di pojok kanan atas.
2. Peramban web akan otomatis memunculkan dialog cetak (*Print Preview*).
3. Halaman telah dilengkapi dengan *print stylesheet* canggih:
   - Bilah navigasi (Navbar), Sidebar admin, tombol aksi, dan panel filter otomatis **disembunyikan** saat dicetak.
   - Hanya judul laporan, tanggal cetak, dan tabel data transaksi bersih yang akan dicetak.
4. Pilih printer fisik atau simpan langsung sebagai **Save as PDF**.

---

## 4.8 Mengelola Profil Juru Kunci

Juru Kunci juga dapat memperbarui profil pribadinya melalui menu `/profil` (mengubah nomor kontak darurat padepokan, alamat, dan foto profil).

---

# 5. Tanya Jawab (FAQ) & Panduan Penanganan Kendala

### Q1: Mengapa tombol "Lakukan Ritual Pemanggilan" tidak bisa diklik pada khodam tertentu?
> **Jawaban:** Khodam tersebut berstatus **Sedang Bersemayam** (sedang dipinjam oleh pengamal lain). Satu khodam tidak dapat dipinjam oleh dua orang sekaligus. Tunggu hingga khodam tersebut dilepaskan kembali oleh Juru Kunci.

### Q2: Mengapa muncul pesan error "Batas raga penuh! Ragamu hanya mampu menampung maksimal 2 khodam"?
> **Jawaban:** Sesuai aturan padepokan (BR-01), kapasitas biologis dan spiritual setiap pengamal dibatasi maksimal **2 khodam aktif**. Kamu harus mengembalikan salah satu khodam terlebih dahulu melalui Juru Kunci sebelum dapat meminjam khodam baru.

### Q3: Mengapa Pengamal tidak menemukan tombol "Lepaskan Khodam" di dasbornya?
> **Jawaban:** Sesuai Ketentuan Soal No. 12 dan 13, pelepasan khodam hanya dapat dilakukan oleh **Juru Kunci** untuk memverifikasi kondisi energi khodam dan menghitung mahar denda keterlambatan secara adil. Silakan gunakan tombol **"Hubungi Juru Kunci"**.

### Q4: Bagaimana rumus perhitungan mahar keterlambatan?
> **Jawaban:** Jika pengembalian dilakukan setelah tanggal jatuh tempo:
> $$\text{Mahar Denda} = (\text{Tanggal Pelepasan} - \text{Tanggal Jatuh Tempo}) \times \text{Rp5.000}$$
> Jika dikembalikan tepat waktu atau lebih awal, mahar keterlambatan adalah **Rp0**.

### Q5: Mengapa ada dua khodam bernama "Macan Putih" di dalam katalog? Apakah ini error?
> **Jawaban:** Bukan error. Sesuai Ketentuan Soal No. 8 (BR-07), sistem memperbolehkan nama unit khodam yang sama asalkan memiliki **Kode Khodam yang berbeda** (misal `KHD-MCP-001` asal Alas Purwo level 4 dan `KHD-MCP-002` asal Gunung Lawu level 5).

### Q6: Bagaimana jika lupa kata sandi akun?
> **Jawaban:** Hubungi Juru Kunci Padepokan. Juru Kunci dapat mengelola akun pengamal melalui menu Master Data Pengamal di `/admin/kelola/pengamal`.

---

**KhodamKu — Padepokan Spiritual Digital**  
*Kelompok 11 Web Development Certification Project · Hak Cipta © 2026*
