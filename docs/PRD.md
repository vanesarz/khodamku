# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# KhodamKu
### *Sewa Khodam, Hidup Lebih Tenang*

---

## Informasi Dokumen

| Atribut Dokumen | Informasi Spesifikasi |
| :--- | :--- |
| **Nama Produk** | **KhodamKu** (*Sewa Khodam, Hidup Lebih Tenang*) |
| **Kategori Sistem** | Web Application (Decoupled Full-Stack Architecture) |
| **Versi Dokumen** | **1.0 (Final - Sinkronisasi)** |
| **Backend REST API** | Laravel 13.x (PHP 8.4) |
| **Frontend SPA** | Next.js 16 (App Router · React 19 · Tailwind CSS) |
| **Basis Data** | MySQL 8.x |
| **Otentikasi & Sesi** | Laravel Sanctum (Token & Cookie-based SPA Authentication) |
| **Dokumen Acuan** | [BRD.md](BRD.md) · [Flowchart_ERD.md](Flowchart_ERD.md) · [UAT_Results.md](UAT_Results.md) · [Project_Documentation.md](Project_Documentation.md) |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Aktor Sistem & Matriks Hak Akses](#2-aktor-sistem--matriks-hak-akses)
3. [Spesifikasi Kebutuhan Fungsional (FR)](#3-spesifikasi-kebutuhan-fungsional-fr)
4. [Logika Sistem, State Machine & Penegakan Aturan Bisnis](#4-logika-sistem-state-machine--penegakan-aturan-bisnis)
5. [Arsitektur Antarmuka & Alur Navigasi](#5-arsitektur-antarmuka--alur-navigasi)
6. [Validasi Data & Integritas Masukan](#6-validasi-data--integritas-masukan)
7. [Rancangan Basis Data Fisik](#7-rancangan-basis-data-fisik)
8. [Ketentuan Teknis Implementasi](#8-ketentuan-teknis-implementasi)
9. [Data Seed Pengujian & Demonstrasi](#9-data-seed-pengujian--demonstrasi)
10. [Kebutuhan Nonfungsional Teknis (NFR)](#10-kebutuhan-nonfungsional-teknis-nfr)
11. [Kerangka Verifikasi Penerimaan Pengguna (UAT)](#11-kerangka-verifikasi-penerimaan-pengguna-uat)

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen
Product Requirements Document (PRD) ini menjabarkan spesifikasi teknis, arsitektur antarmuka, rancangan basis data, logika sistem, serta kriteria penerimaan fungsional dari aplikasi **KhodamKu**. Dokumen ini bertindak sebagai pedoman teknis (**HOW**) bagi pengembang, arsitek sistem, dan penguji (QA), menerjemahkan kebutuhan bisnis yang telah ditetapkan dalam [BRD.md](BRD.md).

## 1.2 Gambaran Produk & Solusi
KhodamKu mengimplementasikan proses bisnis persewaan barang komersial dengan balutan tema budaya populer *cek khodam*. Sistem dibangun menggunakan arsitektur *decoupled*:
- **Backend (Laravel 13.x):** Menyediakan RESTful API yang menangani otentikasi Sanctum, validasi data server-side, kontrol konkurensi basis data, dan kalkulasi denda otomatis.
- **Frontend (Next.js 16):** Menyajikan antarmuka Single Page Application (SPA) yang responsif, menyajikan visual tematik modern, katalog interaktif, dan format pencetakan laporan transaksi.

## 1.3 Sasaran Produk (*Product Goals*)
Spesifikasi teknis produk dirancang untuk merealisasikan sasaran bisnis pada [BRD: Bab 3 (Tujuan Bisnis)](BRD.md#3-tujuan-bisnis--indikator-keberhasilan) dengan keunggulan teknis berikut:
1. **Keamanan Berlapis:** Mencegah kebocoran akses data lintas akun melalui otentikasi sesi Sanctum dan isolasi kueri server-side.
2. **Keandalan Transaksi (*Race-Condition Free*):** Menjamin kuota maksimal 2 peminjaman dan ketersediaan stok melalui mekanisme transaksi atomik dan penguncian baris basis data (*pessimistic locking*).
3. **Determinisme Kalkulasi:** Perhitungan denda keterlambatan (Rp5.000/hari) dieksekusi secara otomatis dan deterministik saat pelepasan unit.
4. **Kesiapan Audit:** Seluruh data transaksi masa lalu tersimpan permanen sebagai catatan historis (*immutable records*) yang dapat dicetak kapan saja.

## 1.4 Batasan Teknis Produk
Mengacu pada ruang lingkup bisnis pada [BRD: Bab 5 (Ruang Lingkup)](BRD.md#5-ruang-lingkup-bisnis), implementasi produk dibatasi pada sistem web internal mandiri:
- Tidak mengintegrasikan sistem gerbang pembayaran eksternal (*payment gateway*).
- Tidak menggunakan layanan pesan pihak ketiga (SMS/WhatsApp/Email gateway).
- Transaksi peminjaman dibatasi secara sistem hanya untuk pengguna dengan peran `pengamal`.

---

# 2. Aktor Sistem & Matriks Hak Akses

## 2.1 Definisi Persona Aktor
Sistem mengidentifikasi tiga kategori aktor yang berinteraksi dengan aplikasi:
1. **Tamu (*Guest*):** Pengguna tanpa sesi otentikasi, hanya diizinkan mengakses halaman otentikasi masuk (*login*).
2. **Pengamal (`pengamal`):** Anggota terdaftar yang memiliki hak meminjam unit khodam, memantau masa sewa unit miliknya, dan memperbarui profil pribadi.
3. **Juru Kunci (`juru_kunci` / `admin`):** Administrator yang memiliki wewenang penuh mengelola inventaris khodam, kategori, data pengamal, memproses pelepasan unit, dan mencetak laporan transaksi.

## 2.2 Matriks Hak Akses Otoritatif

| Modul / Fitur | Rute Frontend (Next.js) | Endpoint API (Laravel) | Guest | Pengamal | Juru Kunci | Middleware Pengaman |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Login Sesi** | `/login` | `POST /api/login` | Ya | Ya | Ya | `guest` |
| **Keluar Sesi (Logout)** | Navbar | `POST /api/logout` | Tidak | Ya | Ya | `auth:sanctum` |
| **Dashboard** | `/dashboard` | `GET /api/dashboard` | Tidak | Pribadi | Global | `auth:sanctum` |
| **Kelola Profil Sendiri** | `/profil` | `GET/POST /api/profile` | Tidak | Ya | Ya | `auth:sanctum` |
| **Katalog & Pencarian** | `/katalog` | `GET /api/khodam` | Tidak | Ya | Ya | `auth:sanctum` |
| **Detail Khodam** | `/katalog/[id]` | `GET /api/khodam/{id}` | Tidak | Ya | Ya | `auth:sanctum` |
| **Ajukan Peminjaman** | Modal Pemanggilan | `POST /api/pemanggilan` | Tidak | Ya | Tidak | `auth:sanctum`, `role:pengamal` |
| **Daftar Pemanggilan Sendiri** | `/pemanggilan` | `GET /api/pemanggilan/my` | Tidak | Ya | Tidak | `auth:sanctum`, `role:pengamal` |
| **Riwayat Transaksi Pribadi** | `/riwayat` | `GET /api/riwayat/my` | Tidak | Ya | Tidak | `auth:sanctum`, `role:pengamal` |
| **CRUD Master Khodam** | `/admin/kelola/khodam` | `/api/admin/khodam/*` | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |
| **CRUD Master Kategori** | `/admin/kelola/kategori` | `/api/admin/kategori/*` | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |
| **CRUD Akun Pengamal** | `/admin/kelola/pengamal` | `/api/admin/pengamal/*` | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |
| **Pantau Seluruh Pemanggilan** | `/admin/pemanggilan` | `GET /api/admin/pemanggilan` | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |
| **Proses Pelepasan Khodam** | Modal Pelepasan | `POST /api/admin/pemanggilan/{id}/lepas` | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |
| **Buku Catatan Gaib (Laporan)** | `/admin/buku-catatan-gaib` | `GET /api/admin/riwayat` | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |
| **Cetak Dokumen Laporan** | Tombol Cetak Dokumen | Cetak Berkas / Print View | Tidak | Tidak | Ya | `auth:sanctum`, `role:admin` |

> **Catatan Pengamanan Server:** Otorisasi diverifikasi secara mutlak di sisi server melalui middleware Laravel. Frontend menyelaraskan visibilitas tombol dan tautan menu berdasarkan status peran token aktif.

---

# 3. Spesifikasi Kebutuhan Fungsional (FR)

### Modul 1: Autentikasi & Pengelolaan Sesi

#### FR-01 — Autentikasi Masuk Pengguna
- **Aktor:** Tamu / Seluruh Pengguna
- **Endpoint:** `POST /api/login`
- **Deskripsi:** Mengautentikasi pengguna via kredensial email dan kata sandi, mengembalikan token sesi Sanctum serta objek profil peran pengguna.
- **Kriteria Penerimaan (*Acceptance Criteria*):**
  1. Input kredensial yang valid menghasilkan respons HTTP 200 dengan token sesi dan data pengguna.
  2. Kredensial tidak valid ditolak dengan HTTP 422 tanpa membocorkan eksistensi spesifik alamat email.
  3. Pengguna yang belum login dialihkan secara otomatis ke halaman `/login` saat mengakses rute internal.
  4. Pengguna diarahkan ke antarmuka yang sesuai: Juru Kunci ke dashboard admin, Pengamal ke dashboard personal.

#### FR-02 — Otorisasi dan Pembatasan Akses
- **Aktor:** Sistem
- **Deskripsi:** Menerapkan pembatasan wewenang ketat berdasarkan peran akun pada setiap rute dan endpoint.
- **Kriteria Penerimaan:**
  1. Pengamal yang mencoba mengakses rute `/admin/*` atau endpoint `/api/admin/*` otomatis menerima penolakan HTTP 403 Forbidden.
  2. Juru Kunci tidak dapat mengajukan peminjaman unit khodam untuk diri sendiri.
  3. Isolasi data diterapkan total: Pengamal tidak dapat melihat atau mengubah data pemanggilan dan profil anggota lain.

---

### Modul 2: Profil Pengguna

#### FR-03 — Pembuatan Profil Otomatis (1:1)
- **Aktor:** Sistem
- **Referensi Bisnis:** [BRD: BR-08](BRD.md#8-aturan-bisnis-utama)
- **Deskripsi:** Membuat satu entitas baris profil pada tabel `profiles` secara otomatis ketika akun `users` baru didaftarkan.
- **Kriteria Penerimaan:**
  1. Registrasi akun baru (baik dari seeder maupun form admin) otomatis menyertakan baris entitas profil terkait.
  2. Kolom `profiles.user_id` menerapkan relasi kunci unik (*unique constraint*) dan foreign key *cascade on delete*.
  3. Pembaruan data akun tidak memicu pembuatan profil duplikat.

#### FR-04 — Pengelolaan Profil Mandiri
- **Aktor:** Pengamal & Juru Kunci
- **Endpoint:** `GET /api/profile`, `POST /api/profile`
- **Deskripsi:** Pengguna dapat melihat dan memperbarui informasi personal profil miliknya.
- **Kriteria Penerimaan:**
  1. Form profil mendukung pembaruan nomor telepon, alamat, tanggal lahir, weton Jawa, dan unggah foto profil.
  2. Validasi memastikan format berkas foto berupa gambar (JPG, JPEG, PNG, WEBP) dengan ukuran maksimal 2MB.
  3. Perubahan tersimpan secara instan dan memperbarui tampilan avatar pada antarmuka.

---

### Modul 3: Manajemen Master Data Khodam & Kategori

#### FR-05 — Penelusuran Katalog Khodam
- **Aktor:** Pengamal & Juru Kunci
- **Endpoint:** `GET /api/khodam`
- **Deskripsi:** Menampilkan daftar katalog unit khodam beserta atribut: kode, nama, asal, level (1–5), foto, kategori terkait, dan status ketersediaan.
- **Kriteria Penerimaan:**
  1. Status ketersediaan dihitung dinamis dari ada/tidaknya transaksi peminjaman aktif: lencana **Menunggu Dipanggil** (tersedia) atau **Sedang Bersemayam** (dipinjam).
  2. Unit yang sedang bersemayam tidak dapat dipilih untuk dipinjam oleh anggota lain.

#### FR-06 — Pencarian & Filter Katalog
- **Aktor:** Pengamal & Juru Kunci
- **Endpoint:** `GET /api/khodam?search={query}&kategori_id={id}`
- **Deskripsi:** Menyediakan filter kategori dan pencarian kata kunci berbasis nama unit.
- **Kriteria Penerimaan:**
  1. Pencarian teks mencocokkan substring nama khodam secara *case-insensitive*.
  2. Khodam dengan nama yang sama tetap muncul seluruhnya dengan kode unik masing-masing.
  3. Bila hasil pencarian kosong, antarmuka menampilkan pesan komunikatif: *"Khodam tidak ditemukan"*.

#### FR-07 — Detail Khodam
- **Aktor:** Pengamal & Juru Kunci
- **Endpoint:** `GET /api/khodam/{id}`
- **Deskripsi:** Menyajikan profil lengkap khodam, deskripsi spiritual, level kekuatan, daftar kategori terkait, dan tombol pemanggilan.
- **Kriteria Penerimaan:**
  1. Informasi detail sesuai dengan data unit terpilih di basis data.
  2. Tombol pemanggilan hanya aktif jika status unit tersedia dan pengguna berstatus Pengamal.

#### FR-08 — CRUD Master Khodam
- **Aktor:** Juru Kunci
- **Endpoint:** `GET|POST|PUT|DELETE /api/admin/khodam/*`
- **Referensi Bisnis:** [BRD: BR-07](BRD.md#8-aturan-bisnis-utama)
- **Deskripsi:** Mengelola entitas unit khodam termasuk pemilihan multi-kategori (*many-to-many*).
- **Kriteria Penerimaan:**
  1. Kolom `kode_khodam` wajib unik; nama khodam diizinkan sama.
  2. Level kekuatan divalidasi integer antara rentang 1 sampai 5.
  3. Satu khodam dapat ditautkan ke banyak kategori via tabel pivot `kategori_khodam`.
  4. Unit yang memiliki riwayat transaksi aktif dilindungi dari penghapusan permanen yang merusak integritas data.

#### FR-09 — CRUD Master Kategori
- **Aktor:** Juru Kunci
- **Endpoint:** `GET|POST|PUT|DELETE /api/admin/kategori/*`
- **Deskripsi:** Mengelola klasifikasi kategori tuah khodam.
- **Kriteria Penerimaan:**
  1. Nama kategori wajib unik dan tidak boleh kosong.
  2. Kategori dapat ditautkan ke banyak unit khodam (*Many-to-Many*).
  3. Penghapusan kategori tidak menghapus unit khodam, melainkan hanya melepaskan relasi pada tabel pivot.

---

### Modul 4: Manajemen Akun Pengamal

#### FR-10 — CRUD Data Pengamal
- **Aktor:** Juru Kunci
- **Endpoint:** `GET|POST|PUT|DELETE /api/admin/pengamal/*`
- **Deskripsi:** Juru Kunci dapat menambahkan anggota baru, melihat daftar pengamal, menyunting, dan menonaktifkan akun.
- **Kriteria Penerimaan:**
  1. Pendaftaran akun Pengamal baru otomatis menginisialisasi entitas profil terkait (1:1).
  2. Alamat email divalidasi keunikannya; kata sandi wajib dienkripsi (*hash*).
  3. Akun yang memiliki riwayat transaksi aktif dilindungi dari penghapusan sembarangan.

---

### Modul 5: Transaksi Pemanggilan Khodam

#### FR-11 — Pengajuan Pemanggilan Khodam
- **Aktor:** Pengamal & Sistem
- **Endpoint:** `POST /api/pemanggilan`
- **Referensi Bisnis:** [BRD: BR-01, BR-02, BR-03](BRD.md#8-aturan-bisnis-utama)
- **Deskripsi:** Mengajukan peminjaman unit khodam yang sedang berstatus tersedia.
- **Kriteria Penerimaan:**
  1. Sistem memvalidasi bahwa pemohon memiliki peran `pengamal`.
  2. Sistem menolak pemanggilan jika Pengamal telah memiliki 2 transaksi berstatus `aktif` ([BRD: BR-01]).
  3. Sistem menolak pemanggilan jika unit khodam sedang berstatus `aktif` pada peminjaman lain ([BRD: BR-02]).
  4. Tanggal jatuh tempo ditetapkan otomatis tepat 5 hari kalender ke depan (`tgl_jatuh_tempo = tgl_panggil + 5 hari`) ([BRD: BR-03]).
  5. Status awal transaksi disetel ke `aktif` dan mahar awal bernilai 0.
  6. Proses diverifikasi dalam transaksi atomik dengan *row locking* untuk mencegah *race condition*.

#### FR-12 — Pemantauan Pemanggilan Saya
- **Aktor:** Pengamal
- **Endpoint:** `GET /api/pemanggilan/my`
- **Deskripsi:** Menampilkan daftar peminjaman aktif milik akun yang sedang login.
- **Kriteria Penerimaan:**
  1. Hanya menampilkan transaksi berstatus `aktif` milik akun Pengamal terkait.
  2. Menampilkan countdown sisa hari sewa menuju jatuh tempo dan estimasi denda jika terlambat.
  3. Halaman tidak menyediakan tombol pelepasan mandiri, melainkan petunjuk untuk menghubungi Juru Kunci.

#### FR-13 — Pemantauan Pemanggilan Padepokan Global
- **Aktor:** Juru Kunci
- **Endpoint:** `GET /api/admin/pemanggilan`
- **Deskripsi:** Menampilkan seluruh transaksi berstatus aktif di padepokan dengan indikator keterlambatan.
- **Kriteria Penerimaan:**
  1. Menampilkan seluruh data peminjaman aktif: nama pengamal, kode unit, tanggal sewa, jatuh tempo, dan status durasi.
  2. Menyediakan tombol aksi cepat untuk memicu dialog proses pelepasan unit.

---

### Modul 6: Transaksi Pelepasan & Kalkulasi Mahar

#### FR-14 — Pemrosesan Pelepasan Unit Khodam
- **Aktor:** Juru Kunci
- **Endpoint:** `POST /api/admin/pemanggilan/{id}/lepas`
- **Referensi Bisnis:** [BRD: BR-06](BRD.md#8-aturan-bisnis-utama)
- **Deskripsi:** Memproses penyelesaian transaksi sewa saat Pengamal mengembalikan unit ke Juru Kunci.
- **Kriteria Penerimaan:**
  1. Operasi hanya dapat dieksekusi oleh pengguna ber-role `juru_kunci`.
  2. Transaksi yang diproses wajib berstatus `aktif` (transaksi yang sudah `dilepas` ditolak).
  3. Sistem mencatat tanggal pengembalian aktual (`tgl_pelepasan`), menghitung mahar, dan mengubah status menjadi `dilepas`.
  4. Unit khodam otomatis kembali berstatus **Menunggu Dipanggil** (tersedia) setelah pelepasan sukses.

#### FR-15 — Kalkulasi Otomatis Mahar Keterlambatan
- **Aktor:** Sistem
- **Referensi Bisnis:** [BRD: BR-04, BR-05](BRD.md#8-aturan-bisnis-utama)
- **Deskripsi:** Menghitung sanksi denda keterlambatan secara otomatis saat pengembalian diproses.
- **Kriteria Penerimaan:**
  1. Jika `tgl_pelepasan <= tgl_jatuh_tempo`, denda bernilai Rp0.
  2. Jika `tgl_pelepasan > tgl_jatuh_tempo`, denda dihitung: `selisih_hari_kalender × Rp5.000` per unit sewa.
  3. Nilai denda tersimpan permanen pada kolom `mahar` sebagai data historis transaksi.
  4. Nilai denda tidak pernah bernilai negatif.

---

### Modul 7: Buku Catatan Gaib & Pelaporan Transaksi

#### FR-16 — Rekapitulasi Riwayat Transaksi (Buku Catatan Gaib)
- **Aktor:** Juru Kunci & Pengamal
- **Endpoint:** `GET /api/admin/riwayat` (Admin), `GET /api/riwayat/my` (Pengamal)
- **Deskripsi:** Menampilkan seluruh log riwayat peminjaman yang telah selesai maupun yang masih aktif.
- **Kriteria Penerimaan:**
  1. Juru Kunci dapat melihat seluruh data riwayat seluruh anggota padepokan.
  2. Pengamal hanya dapat melihat data riwayat peminjaman atas namanya sendiri.
  3. Tersedia fitur pencarian dan filter multi-kriteria: berdasarkan nama pengamal, status, dan rentang tanggal.

#### FR-17 — Pencetakan Dokumen Laporan Transaksi
- **Aktor:** Juru Kunci
- **Deskripsi:** Mencetak berkas dokumen laporan riwayat peminjaman ke format siap cetak (kertas atau PDF).
- **Kriteria Penerimaan:**
  1. Dokumen yang dicetak menyesuaikan hasil filter data yang sedang aktif pada layar.
  2. Tampilan cetak menerapkan stylesheet khusus `@media print` yang menghilangkan navigasi navbar, tombol aksi, dan sidebar.
  3. Format laporan menyertakan kop resmi padepokan KhodamKu, tabel transaksi terstruktur, dan rekapitulasi total denda.

---

### Modul 8: Tata Kelola Data & Deliverables Sertifikasi

#### FR-18 — Validasi Masukan Server-Side
- **Aktor:** Sistem
- **Deskripsi:** Memvalidasi seluruh masukan formulir di tingkat server sebelum eksekusi basis data.
- **Kriteria Penerimaan:** Seluruh masukan wajib diverifikasi aturan integritasnya (`required`, `unique`, `numeric 1-5`, `date`).

#### FR-19 — Skema Migrasi Basis Data
- **Aktor:** Tim Pengembang
- **Deskripsi:** Menyediakan berkas migrasi Laravel untuk 6 tabel relasional inti (`users`, `profiles`, `kategoris`, `khodams`, `kategori_khodam`, `pemanggilans`).
- **Kriteria Penerimaan:** Migrasi dapat dijalankan secara bersih (`php artisan migrate:fresh`) tanpa galat sintaks atau ketergantungan relasi.

#### FR-20 — Data Bawaan (*Database Seeder*)
- **Aktor:** Tim Pengembang
- **Deskripsi:** Menyediakan seeder untuk menyiapkan lingkungan demo yang konsisten.
- **Kriteria Penerimaan:** Seeder membuat 1 akun Juru Kunci, 3 akun Pengamal, 6 kategori, 8 unit khodam, dan relasi transaksi awal.

#### FR-21 — Kelengkapan Berkas README Proyek
- **Aktor:** Tim Pengembang
- **Deskripsi:** Menyediakan dokumentasi `README.md` berstandar industri pada akar repositori.
- **Kriteria Penerimaan:** Memuat identitas tim, nama kelompok, daftar fitur, gambar ERD, video demo, dan panduan instalasi.

---

# 4. Logika Sistem, State Machine & Penegakan Aturan Bisnis

Bagian ini mendefinisikan implementasi logis di sisi kode sistem terhadap kebijakan bisnis yang telah dimandatkan dalam [BRD: Bab 8 (Aturan Bisnis)](BRD.md#8-aturan-bisnis-utama).

## 4.1 State Machine Siklus Hidup Unit & Transaksi

### Transisi Status Transaksi Peminjaman (`pemanggilans.status`):
```text
[Formulir Pengajuan] 
       │
       ▼ (Validasi Kuota < 2 & Unit Tersedia)
   ┌─────────┐
   │  AKTIF  │ ──► Unit Khodam berstatus "Sedang Bersemayam"
   └─────────┘
       │
       ▼ (Eksekusi Pelepasan oleh Juru Kunci)
   ┌─────────┐
   │ DILEPAS │ ──► Unit Khodam kembali "Menunggu Dipanggil" (Tersedia)
   └─────────┘     Pencatatan tgl_pelepasan aktual & mahar historis
```

### Matriks Transisi Status:
| Entitas | Status Awal | Aksi / Pemicu | Status Akhir | Dampak Sistem |
| :--- | :--- | :--- | :--- | :--- |
| **Transaksi** | *(Baru)* | Submit Pemanggilan | `aktif` | `tgl_panggil = today()`, `tgl_jatuh_tempo = today() + 5 hari`, `mahar = 0`. |
| **Transaksi** | `aktif` | Pelepasan Khodam | `dilepas` | `tgl_pelepasan = today()`, kalkulasi `mahar`, transaksi berstatus selesai. |
| **Khodam** | *Tersedia* | Pemanggilan Berhasil | *Bersemayam* | Ditandai sibuk; dinonaktifkan dari katalog peminjaman anggota lain. |
| **Khodam** | *Bersemayam* | Pelepasan Berhasil | *Tersedia* | Kembali aktif pada katalog dan dapat dipinjam oleh pengamal manapun. |

## 4.2 Formula & Algoritma Kalkulasi Mahar Denda
Mengimplementasikan [BRD: BR-04 & BR-05](BRD.md#8-aturan-bisnis-utama):

```php
$tarifPerHari = config('khodamku.tarif_denda', 5000);
$tglJatuhTempo = Carbon::parse($pemanggilan->tgl_jatuh_tempo)->startOfDay();
$tglPelepasan = Carbon::parse($request->tgl_pelepasan ?? now())->startOfDay();

if ($tglPelepasan->greaterThan($tglJatuhTempo)) {
    $hariTerlambat = $tglJatuhTempo->diffInDays($tglPelepasan);
    $mahar = $hariTerlambat * $tarifPerHari;
} else {
    $hariTerlambat = 0;
    $mahar = 0;
}
```

- **Perhitungan Kalender:** Selisih dihitung berdasarkan perpindahan hari kalender (`diffInDays`), bukan durasi jam.
- **Hari Ke-5:** Pengembalian pada tanggal jatuh tempo tidak dikenakan denda ($hariTerlambat = 0$).
- **Nilai Historis:** Nilai `mahar` disimpan ke dalam basis data saat pelepasan agar nilai tidak berubah bila tarif denda di masa depan diperbarui.

## 4.3 Kontrol Konkurensi Basis Data (*Race Condition Prevention*)
Untuk menegakkan [BRD: BR-01 (Maksimal 2 Unit)] dan [BRD: BR-02 (Satu Unit Satu Pengamal)], sistem menerapkan transaksi atomik dengan *pessimistic row locking*:

```php
DB::transaction(function () use ($user, $khodamId) {
    // 1. Kunci baris user dan periksa kuota aktif
    $activeCount = Pemanggilan::where('user_id', $user->id)
        ->where('status', 'aktif')
        ->lockForUpdate()
        ->count();

    if ($activeCount >= 2) {
        throw new BusinessRuleException("Ragamu sudah menampung 2 khodam, lepaskan salah satu dulu.");
    }

    // 2. Kunci dan periksa ketersediaan unit khodam
    $isOccupied = Pemanggilan::where('khodam_id', $khodamId)
        ->where('status', 'aktif')
        ->lockForUpdate()
        ->exists();

    if ($isOccupied) {
        throw new BusinessRuleException("Khodam sedang bersemayam di raga lain.");
    }

    // 3. Simpan transaksi pemanggilan baru
    return Pemanggilan::create([...]);
});
```

## 4.4 Standar Penanganan Kesalahan & Kode Status HTTP

| Kondisi Logika Sistem | Pesan Kesalahan Komunikatif | Kode HTTP |
| :--- | :--- | :---: |
| Kuota aktif telah mencapai 2 ([BRD: BR-01]) | *"Ragamu sudah menampung 2 khodam, lepaskan salah satu dulu."* | `400 Bad Request` |
| Khodam sedang dipinjam orang lain ([BRD: BR-02]) | *"Khodam sedang bersemayam di raga lain."* | `400 Bad Request` |
| Pelepasan diajukan oleh non-admin ([BRD: BR-06]) | *"Akses ditolak. Ritual pelepasan hanya wewenang Juru Kunci."* | `403 Forbidden` |
| Transaksi yang hendak dilepas sudah berstatus selesai | *"Pelepasan gagal. Transaksi pemanggilan telah diselesaikan sebelumnya."* | `400 Bad Request` |
| Pelanggaran validasi masukan formulir | *(Daftar galat spesifik per field)* | `422 Unprocessable` |

---

# 5. Arsitektur Antarmuka & Alur Navigasi

## 5.1 Struktur Hirarki Halaman (Sitemap)

```text
├── / (Halaman Depan / Landing Page)
├── /login (Otentikasi Pengguna)
│
├── AREA PENGAMAL (Role: pengamal)
│   ├── /dashboard (Ringkasan Kuota & Pemanggilan Aktif Pengamal)
│   ├── /katalog (Katalog Khodam, Pencarian Nama, Filter Kategori)
│   │   └── /katalog/[id] (Detail Khodam & Tombol Panggil)
│   ├── /pemanggilan (Daftar Khodam Aktif Milik Sendiri & Tombol Hubungi Admin)
│   ├── /riwayat (Buku Catatan Transaksi Selesai Milik Sendiri)
│   └── /profil (Formulir Pembaruan Data Profil Pribadi)
│
└── AREA JURU KUNCI (Role: admin)
    ├── /admin/dashboard (Statistik Inventaris, Kuota Bersemayam, Keterlambatan)
    ├── /admin/kelola/khodam (Tabel Master Khodam, Tambah, Edit, Hapus)
    ├── /admin/kelola/kategori (Tabel Master Kategori, Tambah, Edit, Hapus)
    ├── /admin/kelola/pengamal (Tabel Anggota Pengamal, Tambah, Edit, Hapus)
    ├── /admin/pemanggilan (Seluruh Pemanggilan Aktif & Modal Pelepasan Khodam)
    └── /admin/buku-catatan-gaib (Laporan Riwayat Global, Filter, & Tombol Cetak)
```

## 5.2 Alur Perjalanan Pengguna Utama (*User Journeys*)

### 1. Alur Pemanggilan Khodam (Pengamal):
1. Pengamal login ke aplikasi ➔ Masuk ke `/dashboard`.
2. Membuka menu `/katalog` ➔ Melakukan pencarian unit atau filter kategori.
3. Memilih unit dengan lencana **Menunggu Dipanggil** ➔ Masuk ke detail unit.
4. Menekan tombol **Panggil Khodam** ➔ Sistem memvalidasi kuota dan ketersediaan stok via API.
5. Bila sukses: Notifikasi berhasil tampil, transaksi berstatus `aktif` dengan durasi 5 hari, dan pengamal diarahkan ke menu `/pemanggilan`.

### 2. Alur Pengembalian & Pelepasan Unit (Juru Kunci):
1. Pengamal menghubungi Juru Kunci untuk melepaskan unit khodam.
2. Juru Kunci login ➔ Membuka menu `/admin/pemanggilan`.
3. Memilih kartu/baris transaksi Pengamal yang bersangkutan ➔ Menekan tombol **Lepaskan Khodam**.
4. Modal pelepasan terbuka: Menampilkan tanggal sewa, tanggal jatuh tempo, tanggal pelepasan hari ini, jumlah hari keterlambatan, dan kalkulasi mahar denda.
5. Juru Kunci menekan **Konfirmasi Pelepasan** ➔ Sistem menyimpan data dan unit khodam kembali berstatus tersedia.

---

# 6. Validasi Data & Integritas Masukan

Validasi diterapkan di sisi server menggunakan mekanisme FormRequest Laravel untuk menjamin keamanan mutlak data:

| Entitas Form | Nama Field | Aturan Validasi Laravel | Keterangan Integritas |
| :--- | :--- | :--- | :--- |
| **Login** | `email` | `required\|string\|email` | Format email standar. |
| | `password` | `required\|string` | Kata sandi tidak boleh kosong. |
| **Profil** | `no_hp` | `nullable\|string\|max:20` | Nomor kontak pengguna. |
| | `alamat` | `nullable\|string\|max:500` | Alamat domisili. |
| | `tanggal_lahir` | `nullable\|date\|before:today` | Tanggal lahir valid di masa lampau. |
| | `weton` | `nullable\|string\|max:50` | Nilai weton penanggalan Jawa. |
| | `foto` | `nullable\|image\|mimes:jpg,jpeg,png,webp\|max:2048` | Berkas gambar maksimum 2MB. |
| **Master Khodam** | `kode_khodam` | `required\|string\|max:50\|unique:khodams,kode_khodam` | Wajib unik di basis data ([BRD: BR-07]). |
| | `nama` | `required\|string\|max:100` | Nama boleh sama/duplikat. |
| | `asal` | `required\|string\|max:100` | Asal daerah unit. |
| | `level_kekuatan` | `required\|integer\|min:1\|max:5` | Bilangan bulat rentang 1–5. |
| | `deskripsi` | `required\|string` | Ulasan kesaktian unit. |
| | `kategori_ids` | `required\|array\|min:1` | Wajib memilih minimal 1 kategori. |
| | `kategori_ids.*`| `exists:kategoris,id` | ID kategori harus valid di tabel master. |
| | `foto` | `nullable\|image\|mimes:jpg,jpeg,png,webp\|max:2048` | Berkas foto ilustrasi khodam. |
| **Master Kategori** | `nama` | `required\|string\|max:50\|unique:kategoris,nama` | Nama kategori wajib unik. |
| | `deskripsi` | `nullable\|string` | Penjelasan fungsi tuah kategori. |
| **Akun Pengamal** | `name` | `required\|string\|max:100` | Nama lengkap anggota. |
| | `email` | `required\|string\|email\|unique:users,email` | Alamat email unik untuk login. |
| | `password` | `required\|string\|min:8` | Sandi akun minimal 8 karakter. |
| **Pemanggilan** | `khodam_id` | `required\|exists:khodams,id` | Unit khodam terdaftar di sistem. |
| **Pelepasan** | `tgl_pelepasan` | `nullable\|date\|after_or_equal:tgl_panggil` | Tanggal tidak mendahului tgl panggil. |

---

# 7. Rancangan Basis Data Fisik

Struktur basis data dinormalisasi mengikuti skema relasional pada [Flowchart_ERD.md](Flowchart_ERD.md) dan gambar referensi `docs/ERD.png`.

## 7.1 Tabel `users`
Menyimpan data identitas kredensial dan peran pengguna:
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'pengamal') NOT NULL DEFAULT 'pengamal',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

## 7.2 Tabel `profiles`
Menyimpan data personal pendukung (Relasi 1:1 dengan `users`):
```sql
CREATE TABLE profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    no_hp VARCHAR(20) NULL,
    alamat TEXT NULL,
    tanggal_lahir DATE NULL,
    weton VARCHAR(50) NULL,
    foto VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 7.3 Tabel `kategoris`
Menyimpan klasifikasi kategori khodam:
```sql
CREATE TABLE kategoris (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

## 7.4 Tabel `khodams`
Menyimpan master data inventaris unit khodam:
```sql
CREATE TABLE khodams (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_khodam VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    asal VARCHAR(100) NOT NULL,
    level_kekuatan TINYINT UNSIGNED NOT NULL,
    deskripsi TEXT NOT NULL,
    foto VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

## 7.5 Tabel Pivot `kategori_khodam`
Menghubungkan relasi *Many-to-Many* antara Khodam dan Kategori:
```sql
CREATE TABLE kategori_khodam (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    khodam_id BIGINT UNSIGNED NOT NULL,
    kategori_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_khodam_kategori (khodam_id, kategori_id),
    CONSTRAINT fk_kk_khodam FOREIGN KEY (khodam_id) REFERENCES khodams(id) ON DELETE CASCADE,
    CONSTRAINT fk_kk_kategori FOREIGN KEY (kategori_id) REFERENCES kategoris(id) ON DELETE CASCADE
);
```

## 7.6 Tabel `pemanggilans`
Mencatat seluruh transaksi peminjaman dan penyelesaian kontrak:
```sql
CREATE TABLE pemanggilans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    khodam_id BIGINT UNSIGNED NOT NULL,
    tgl_panggil DATE NOT NULL,
    tgl_jatuh_tempo DATE NOT NULL,
    tgl_pelepasan DATE NULL,
    mahar DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('aktif', 'dilepas') NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_pemanggilan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pemanggilan_khodam FOREIGN KEY (khodam_id) REFERENCES khodams(id) ON DELETE RESTRICT
);
```

---

# 8. Ketentuan Teknis Implementasi

## 8.1 Arsitektur Decoupled
Aplikasi dibangun menggunakan pola pemisahan penuh:
- **Backend (Laravel):** Bertindak sebagai REST API murni, menggunakan JSON untuk komunikasi data, form validation, Sanctum middleware, dan Eloquent ORM.
- **Frontend (Next.js):** Aplikasi SPA dengan Next.js App Router, komponen reaktif React, styling Tailwind CSS, dan integrasi modal interaktif.

## 8.2 Struktur Pemrosesan Kode
Logika bisnis utama diorganisasi dengan pola modular:
`Request ➔ FormRequest (Validation) ➔ Controller ➔ Service (Business Rules) ➔ Eloquent Model ➔ JSON Response`
- Aturan validasi dipusatkan pada kelas `FormRequest` khusus.
- Logika sewa dan kalkulasi denda dipusatkan pada `PemanggilanService` untuk memudahkan pengujian unit dan menghindari duplikasi logika.

## 8.3 Konfigurasi Nilai Mahar
Tarif denda keterlambatan disimpan pada berkas konfigurasi `config/khodamku.php` yang membaca variabel lingkungan `.env`:
```php
'tarif_denda' => env('TARIF_DENDA_PER_HARI', 5000),
```
Hal ini memastikan tarif tidak ditulis secara *hard-coded* pada controller maupun view.

## 8.4 Standar Tampilan Cetak Dokumen
Fungsi cetak pada menu Buku Catatan Gaib memanfaatkan stylesheet media cetak:
```css
@media print {
  nav, aside, button, .no-print {
    display: none !important;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
}
```
Hal ini menghasilkan dokumen cetak yang bersih dan profesional tanpa elemen navigasi website.

---

# 9. Data Seed Pengujian & Demonstrasi

Data bawaan disiapkan untuk menjamin kelancaran evaluasi dan demonstrasi fitur:

## 9.1 Akun Pengguna Bawaan

| Peran Akun | Nama Pengguna | Alamat Email | Kata Sandi | Skenario Uji Terkait |
| :--- | :--- | :--- | :--- | :--- |
| **Juru Kunci (Admin)** | Mbah Darmo | `admin@khodamku.test` | `password123` | Akses CRUD master data, pelepasan, cetak buku catatan gaib. |
| **Pengamal 1** | Sekar Ayu Lestari | `sekar@khodamku.test` | `password123` | Akun aktif dengan 1 slot peminjaman khodam tersedia. |
| **Pengamal 2** | Bima Saputra | `bima@khodamku.test` | `password123` | Akun dengan 2 peminjaman aktif (pengujian batas maksimal kuota [BRD: BR-01]). |
| **Pengamal 3** | Raka Pratama | `raka@khodamku.test` | `password123` | Akun dengan riwayat transaksi pelepasan (pengujian perhitungan denda). |

## 9.2 Master Kategori Bawaan
1. **Penjaga Rumah:** Khodam pelindung ketenteraman dan keamanan tempat tinggal.
2. **Penglaris Dagangan:** Khodam penarik rezeki dan pemikat pembeli usaha perniagaan.
3. **Pelindung Ujian:** Khodam peningkat konsentrasi, ketenangan pikiran, dan fokus akademik.
4. **Kewibawaan:** Khodam pemancar karisma kepemimpinan dan rasa segan khalayak.
5. **Penolak Bala:** Khodam benteng gaib penangkal energi negatif dan marabahaya.
6. **Pencari Jodoh:** Khodam penumbuh daya pikat asmara dan keharmonisan hubungan.

## 9.3 Roster Unit Khodam Bawaan

| Kode Khodam | Nama Khodam | Level | Asal Daerah | Kategori Terkait |
| :--- | :--- | :---: | :--- | :--- |
| `KHD-MCP-001` | Macan Putih | 5 | Gunung Lawu | Penjaga Rumah, Kewibawaan |
| `KHD-MCP-002` | Macan Putih | 4 | Pajajaran | Penjaga Rumah, Kewibawaan |
| `KHD-HRM-001` | Harimau Sumatra | 4 | Bukit Barisan | Kewibawaan, Penolak Bala |
| `KHD-KBJ-001` | Kakek Berjubah Putih | 4 | Cirebon | Pelindung Ujian, Penolak Bala |
| `KHD-NGH-001` | Naga Hijau | 5 | Laut Selatan | Penglaris Dagangan |
| `KHD-KCO-001` | Kucing Oren Barbar | 3 | Pasar Senen | Penjaga Rumah |
| `KHD-KDP-001` | Kulkas Dua Pintu | 2 | Toko Elektronik Glodok | Penglaris Dagangan |
| `KHD-TPN-001` | Tutup Panci | 1 | Dapur Tetangga | Pencari Jodoh |

> **Catatan Pengujian [BRD: BR-07]:** Dua unit pertama sengaja memiliki nama yang persis sama (**Macan Putih**) dengan kode khodam yang berbeda (`KHD-MCP-001` dan `KHD-MCP-002`) untuk membuktikan sistem mendukung nama duplikat berbasis kode unik.

---

# 10. Kebutuhan Nonfungsional Teknis (NFR)

| Kode | Aspek Mutu Teknis | Spesifikasi Teknis yang Diterapkan |
| :--- | :--- | :--- |
| **NFR-01** | **Kecepatan & Performa API** | Eksekusi kueri Eloquent terindeks; waktu respons API < 500ms; waktu pemuatan halaman katalog < 2 detik pada kondisi jaringan lokal. |
| **NFR-02** | **Kriptografi & Sesi** | Seluruh kata sandi dienkripsi menggunakan algoritma `Bcrypt` (cost factor 12); token sesi diamankan via HTTP-only cookie dan proteksi CSRF. |
| **NFR-03** | **Integritas Transaksi ACID** | Operasi peminjaman dan pelepasan dieksekusi dalam transaksi basis data (`DB::transaction`) untuk mencegah data korup atau parsial. |
| **NFR-04** | **Standar Kode & Modularitas** | Kode backend mematuhi standar PSR-12; komponen frontend terstruktur menggunakan modularisasi React dan Tailwind utility classes. |
| **NFR-05** | **Portabilitas Sistem** | Konfigurasi sistem sepenuhnya terisolasi dalam berkas `.env`; migrasi dan seeder siap dijalankan pada lingkungan basis data MySQL manapun. |

---

# 11. Kerangka Verifikasi Penerimaan Pengguna (UAT)

Verifikasi fungsionalitas dan kepatuhan sistem KhodamKu terhadap seluruh ketentuan dilakukan melalui skenario *User Acceptance Testing* (UAT) komprehensif.

Hasil pengujian eksekusi lengkap yang mencakup **30 skenario pengujian** dengan **tingkat kelulusan 100% (30/30 Lulus)** didokumentasikan secara rinci pada:

👉 **[Lihat Laporan Eksekusi Pengujian: UAT_Results.md](UAT_Results.md)**

Ringkasan cakupan modul pengujian penerimaan pengguna:
1. **Otentikasi & Otorisasi:** UAT-01 s/d UAT-04 (Login benar, password salah, rute terproteksi, pembatasan hak akses).
2. **Profil Pengguna (1:1):** UAT-05 s/d UAT-08 (Pembuatan otomatis, pencegahan profil ganda, pembaruan mandiri, isolasi profil orang lain).
3. **Master Data & Integritas:** UAT-09 s/d UAT-12 (Unit nama sama kode beda, pencegahan kode duplikat, relasi multi-kategori, pencarian nama).
4. **Aturan Bisnis Pemanggilan:** UAT-13 s/d UAT-15 (Pemanggilan sukses, penolakan unit sibuk, penolakan pemanggilan ke-3 melebihi kuota 2).
5. **Pemantauan & Pelepasan Unit:** UAT-16 s/d UAT-20 (Daftar pemanggilan pribadi, proteksi tombol pelepasan, pelepasan tepat waktu Rp0, pelepasan terlambat Rp5.000/hari, monitoring admin).
6. **Pelaporan & Validasi Server:** UAT-21 s/d UAT-25 (Buku catatan gaib, pencetakan dokumen laporan, validasi input kosong, migrasi basis data, seeder konsisten).
7. **Keamanan Tambahan & Transaksi:** UAT-26 s/d UAT-30 (Proteksi CSRF, penanganan race condition, upload berkas, keamanan password hash, respon format JSON).

---

*Dokumen PRD ini telah disinkronkan secara menyeluruh dengan [BRD.md](BRD.md), [Flowchart_ERD.md](Flowchart_ERD.md), dan [UAT_Results.md](UAT_Results.md).*
