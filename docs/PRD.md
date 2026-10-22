# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# KhodamKu
### *Sewa Khodam, Hidup Lebih Tenang*

**Versi:** 1.0  
**Status:** Draft untuk Implementasi  
**Teknologi:** Laravel · Blade · MySQL · Laravel Breeze  
**Kelompok:** Kelompok 11

## Anggota Kelompok

| Nama | NIM |
|---|---|
| Vanesa Rizka Alfatihah | 102022300121 |
| Taufik Qurohman | 102022300211 |
| Ahmad Akmal Amran | 102022300010 |

---

## Informasi Dokumen

| Atribut | Keterangan |
|---|---|
| Nama Produk | KhodamKu: Sewa Khodam, Hidup Lebih Tenang |
| Jenis Aplikasi | Web Application |
| Versi Dokumen | 1.0 |
| Status | Draft untuk Implementasi |
| Backend / Frontend | Laravel / Blade |
| Database | MySQL |
| Autentikasi | Laravel Breeze |

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Aktor dan Hak Akses](#2-aktor-dan-hak-akses)
3. [Kebutuhan Fungsional](#3-kebutuhan-fungsional)
4. [Aturan Bisnis](#4-aturan-bisnis)
5. [Rancangan Halaman dan Antarmuka](#5-rancangan-halaman-dan-antarmuka)
6. [Validasi Data](#6-validasi-data)
7. [Rancangan Database](#7-rancangan-database)
8. [Ketentuan Teknis Implementasi](#8-ketentuan-teknis-implementasi)
9. [Data Seed untuk Demonstrasi](#9-data-seed-untuk-demonstrasi)
10. [Kebutuhan Nonfungsional](#10-kebutuhan-nonfungsional)
11. [User Acceptance Testing (UAT)](#11-user-acceptance-testing-uat)
12. [Pemetaan terhadap 19 Poin Soal](#12-pemetaan-terhadap-19-poin-soal)
13. [Kriteria Penyelesaian Project](#13-kriteria-penyelesaian-project)
14. [Catatan Keputusan Implementasi](#14-catatan-keputusan-implementasi)

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Product Requirements Document (PRD) ini disusun sebagai acuan pengembangan aplikasi KhodamKu. Dokumen menjelaskan kebutuhan produk, fungsi sistem, hak akses pengguna, aturan bisnis, validasi, rancangan halaman, serta kriteria penerimaan setiap fitur.

PRD digunakan untuk memastikan implementasi sesuai dengan BRD, Flowchart, dan Entity Relationship Diagram (ERD), serta menjadi acuan pengujian, UAT, manual book, dan dokumentasi akhir.

## 1.2 Gambaran Produk

KhodamKu adalah aplikasi web peminjaman khodam fiktif yang mengadaptasi tren viral cek khodam menjadi sistem inventaris dan peminjaman unit. Pengamal dapat mencari dan meminjam khodam, memantau masa peminjaman, serta melihat riwayat miliknya. Juru Kunci mengelola inventaris, kategori, anggota, dan proses pelepasan.

Istilah tematik seperti pemanggilan, pelepasan, dan mahar keterlambatan digunakan pada antarmuka, sedangkan proses sistem tetap menerapkan pencatatan transaksi, validasi, dan perhitungan denda. Seluruh konten khodam bersifat fiktif untuk hiburan.

## 1.3 Tujuan Produk

1. Menyediakan katalog khodam yang dapat dicari berdasarkan nama dan kategori.
2. Memfasilitasi peminjaman oleh anggota terdaftar.
3. Mencegah peminjaman melebihi dua unit aktif per anggota.
4. Mencegah satu unit dipinjam lebih dari satu anggota pada waktu bersamaan.
5. Menentukan tanggal jatuh tempo secara otomatis.
6. Menghitung denda keterlambatan berdasarkan durasi keterlambatan.
7. Memudahkan pengelolaan inventaris, kategori, anggota, dan transaksi.
8. Menyediakan riwayat peminjaman yang dapat dilihat dan dicetak.
9. Membatasi akses data sesuai role pengguna.

## 1.4 Ruang Lingkup

### Termasuk

1. Login dan otorisasi role.
2. Pengelolaan profil pengguna.
3. CRUD khodam, kategori, dan Pengamal.
4. Pencarian dan filter katalog.
5. Pemanggilan, pemantauan jatuh tempo, dan pelepasan.
6. Perhitungan mahar keterlambatan.
7. Riwayat dan pencetakan laporan.
8. Validasi, migration, dan seeder.
9. README, screenshot skema database, dan video demo.

### Tidak Termasuk

1. Pembayaran denda online.
2. Notifikasi email atau WhatsApp.
3. Peminjaman khodam oleh Juru Kunci.
4. Pengiriman unit.
5. Integrasi layanan eksternal untuk verifikasi khodam.

---

# 2. Aktor dan Hak Akses

## 2.1 Juru Kunci

Pengguna dengan role `juru_kunci` yang mengelola operasional aplikasi.

1. Melihat dashboard dan status seluruh unit.
2. CRUD khodam, kategori, dan akun Pengamal.
3. Melihat seluruh pemanggilan aktif.
4. Memproses pelepasan khodam.
5. Melihat, memfilter, dan mencetak riwayat seluruh pemanggilan.
6. Mengelola profil sendiri.

## 2.2 Pengamal

Pengguna terdaftar dengan role `pengamal` yang dapat meminjam khodam.

1. Melihat dashboard pribadi.
2. Mencari dan memfilter khodam.
3. Melihat detail serta status ketersediaan.
4. Meminjam khodam yang tersedia.
5. Melihat pemanggilan aktif dan riwayat miliknya.
6. Melihat jatuh tempo dan estimasi mahar.
7. Mengubah profil sendiri.

## 2.3 Matriks Hak Akses

| Fitur | Juru Kunci | Pengamal |
|---|---|---|
| Login | Ya | Ya |
| Dashboard | Admin | Pribadi |
| Melihat/mencari katalog | Ya | Ya |
| Meminjam khodam | Tidak | Ya |
| Melihat pemanggilan aktif | Semua | Milik sendiri |
| Memproses pelepasan | Ya | Tidak |
| CRUD khodam | Ya | Tidak |
| CRUD kategori | Ya | Tidak |
| CRUD akun Pengamal | Ya | Tidak |
| Mengubah profil sendiri | Ya | Ya |
| Melihat riwayat | Semua | Milik sendiri |
| Cetak laporan semua anggota | Ya | Tidak |

> **Ketentuan keamanan:** Semua halaman internal wajib dilindungi autentikasi. Halaman administrasi harus memeriksa role di server, bukan hanya menyembunyikan tombol pada antarmuka.

---

# 3. Kebutuhan Fungsional

## FR-01 — Login Pengguna

**Prioritas:** Must Have  
**Aktor:** Juru Kunci dan Pengamal

Sistem menyediakan login menggunakan email dan password. Setelah autentikasi berhasil, sistem mengarahkan pengguna berdasarkan role.

### Acceptance Criteria

1. Kredensial benar memungkinkan login; kredensial salah ditolak.
2. Pengguna belum login diarahkan ke halaman login saat membuka halaman internal.
3. Juru Kunci masuk ke dashboard admin dan Pengamal ke dashboard pribadi.
4. Pesan error tidak membocorkan apakah email tertentu terdaftar.

## FR-02 — Pembatasan Hak Akses

**Prioritas:** Must Have  
**Aktor:** Sistem

Sistem membatasi akses berdasarkan status login, role, dan kepemilikan data.

### Acceptance Criteria

1. Pengamal tidak dapat menjalankan CRUD admin.
2. Pengamal tidak dapat memproses pelepasan melalui URL atau permintaan langsung.
3. Pengamal hanya dapat melihat data pemanggilan dan profil miliknya.
4. Juru Kunci tidak menggunakan fitur peminjaman sebagai Pengamal.

## FR-03 — Pembuatan Profil

**Prioritas:** Must Have  
**Aktor:** Sistem

Setiap akun memiliki tepat satu profil. Profil dibuat otomatis saat akun dibuat dan memiliki relasi satu-ke-satu melalui `user_id` yang unik.

### Acceptance Criteria

1. Setiap akun baru memiliki satu profil.
2. `user_id` pada `profiles` memiliki unique constraint.
3. Akun dan profil dibuat dalam satu transaksi database.
4. Pembuatan profil tidak berulang saat akun diperbarui.

## FR-04 — Mengubah Profil

**Prioritas:** Must Have  
**Aktor:** Semua pengguna

Pengguna dapat memperbarui profil miliknya, meliputi nomor HP, alamat, tanggal lahir, weton, dan foto sesuai validasi.

### Acceptance Criteria

1. Perubahan tersimpan setelah validasi berhasil.
2. Pengguna tidak dapat mengubah profil pengguna lain.
3. Sistem menampilkan notifikasi sukses atau error per field.

## FR-05 — Melihat Katalog Khodam

**Prioritas:** Must Have  
**Aktor:** Juru Kunci dan Pengamal

Sistem menampilkan kode, nama, asal, level, kategori, foto, dan status ketersediaan khodam. Status dihitung dari pemanggilan aktif.

### Acceptance Criteria

1. Data berasal dari database.
2. Unit yang sedang dipinjam tidak ditampilkan sebagai tersedia.
3. Badge tersedia adalah **Menunggu Dipanggil**; badge dipinjam adalah **Sedang Bersemayam**.
4. Status tidak disimpan sebagai kolom terpisah pada `khodam`.

## FR-06 — Pencarian dan Filter

**Prioritas:** Must Have  
**Aktor:** Juru Kunci dan Pengamal

Sistem menyediakan pencarian berdasarkan nama khodam dan filter berdasarkan kategori.

### Acceptance Criteria

1. Pencarian menemukan unit bernama sama.
2. Filter kategori menampilkan hasil yang sesuai.
3. Hasil menampilkan status ketersediaan.
4. Jika tidak ada hasil, pesan **Khodam tidak ditemukan** ditampilkan.

## FR-07 — Detail Khodam

**Prioritas:** Must Have  
**Aktor:** Juru Kunci dan Pengamal

Halaman detail menampilkan kode, nama, asal, level, deskripsi, foto, kategori, status, dan tombol Panggil bagi Pengamal jika tersedia.

### Acceptance Criteria

1. Detail sesuai dengan unit terpilih.
2. Unit bernama sama dibedakan melalui kode.
3. Unit yang sedang dipinjam tidak dapat dipanggil oleh anggota lain.

## FR-08 — CRUD Khodam

**Prioritas:** Must Have  
**Aktor:** Juru Kunci

Juru Kunci dapat menambah, melihat, mengubah, dan menghapus atau menonaktifkan data khodam, termasuk memilih beberapa kategori.

### Acceptance Criteria

1. Kode wajib dan unik; nama boleh duplikat.
2. Level kekuatan berupa bilangan bulat 1–5.
3. Satu khodam dapat memiliki banyak kategori.
4. Pengamal tidak dapat menjalankan CRUD.
5. Unit yang memiliki riwayat tidak dihapus permanen jika merusak integritas riwayat; gunakan penonaktifan atau tolak penghapusan.

## FR-09 — CRUD Kategori

**Prioritas:** Must Have  
**Aktor:** Juru Kunci

Juru Kunci mengelola kategori yang memiliki nama dan deskripsi.

### Acceptance Criteria

1. Nama kategori wajib dan unik.
2. Kategori dapat terhubung dengan banyak khodam.
3. Penghapusan tidak meninggalkan relasi yang tidak konsisten.
4. Pengamal tidak dapat mengelola kategori.

## FR-10 — CRUD Akun Pengamal

**Prioritas:** Must Have  
**Aktor:** Juru Kunci

Juru Kunci dapat membuat, melihat, memperbarui, dan menghapus atau menonaktifkan akun Pengamal.

### Acceptance Criteria

1. Email unik dan password di-hash.
2. Akun yang dibuat dari fitur ini otomatis mendapat role `pengamal`.
3. Profil dibuat otomatis.
4. Pengubahan akun tidak membuat profil duplikat.
5. Akun dengan riwayat tidak dihapus permanen jika merusak keterlacakan transaksi.

## FR-11 — Melakukan Pemanggilan

**Prioritas:** Must Have  
**Aktor:** Pengamal dan Sistem

Pengamal dapat meminjam unit tersedia. Sistem mencatat transaksi otomatis setelah semua validasi berhasil.

### Acceptance Criteria

1. Role harus `pengamal` dan unit harus tersedia.
2. Jumlah pemanggilan aktif tidak boleh lebih dari dua.
3. Tanggal panggil ditentukan sistem; jatuh tempo lima hari kemudian.
4. Status awal aktif dan mahar awal nol.
5. Sistem mencegah dua permintaan bersamaan meminjam unit yang sama melalui transaksi dan locking database.

## FR-12 — Melihat Pemanggilan Saya

**Prioritas:** Must Have  
**Aktor:** Pengamal

Halaman menampilkan pemanggilan aktif milik pengguna yang login, tanggal, countdown, status, dan estimasi mahar.

### Acceptance Criteria

1. Hanya transaksi milik pengguna yang ditampilkan.
2. Maksimal dua pemanggilan aktif.
3. Sisa waktu dihitung dari jatuh tempo.
4. Jika terlambat, hari keterlambatan dan estimasi mahar ditampilkan.
5. Tidak ada tombol pelepasan.

## FR-13 — Melihat Semua Pemanggilan Aktif

**Prioritas:** Must Have  
**Aktor:** Juru Kunci

Juru Kunci melihat semua transaksi aktif, nama Pengamal, khodam, tanggal, jatuh tempo, keterlambatan, estimasi mahar, dan aksi pelepasan.

### Acceptance Criteria

1. Seluruh transaksi berstatus aktif ditampilkan.
2. Transaksi yang belum jatuh tempo dan terlambat termasuk dalam daftar.
3. Juru Kunci dapat membuka detail dan memilih transaksi untuk dilepas.

## FR-14 — Memproses Pelepasan

**Prioritas:** Must Have  
**Aktor:** Juru Kunci

Pengamal menghubungi Juru Kunci; Juru Kunci memilih transaksi aktif, sistem menghitung mahar, lalu Juru Kunci mengonfirmasi pelepasan.

### Acceptance Criteria

1. Hanya role `juru_kunci` dapat melepas.
2. Transaksi harus berstatus aktif dan tidak dapat dilepas dua kali.
3. Sistem menyimpan tanggal pelepasan, mahar, dan status dilepas secara konsisten.
4. Khodam kembali tersedia setelah pelepasan berhasil.

## FR-15 — Menghitung Mahar

**Prioritas:** Must Have  
**Aktor:** Sistem

Mahar dihitung saat pelepasan: jumlah hari kalender keterlambatan dikali tarif per unit per hari. Tarif awal Rp5.000 dan disimpan dalam konfigurasi.

### Acceptance Criteria

1. Tidak terlambat menghasilkan mahar Rp0.
2. Telat satu hari menghasilkan Rp5.000 per unit.
3. Nilai tidak pernah negatif.
4. Nilai mahar transaksi selesai tersimpan sebagai nilai historis.
5. Tarif tidak ditulis berulang di controller/view.

## FR-16 — Buku Catatan Gaib

**Prioritas:** Must Have  
**Aktor:** Juru Kunci dan Pengamal

Riwayat menampilkan Pengamal, kode/nama khodam, tanggal panggil, jatuh tempo, tanggal pelepasan, mahar, dan status.

### Acceptance Criteria

1. Juru Kunci melihat seluruh riwayat.
2. Pengamal hanya melihat riwayat sendiri.
3. Transaksi selesai tetap tercatat.
4. Data riwayat tidak hilang saat status berubah.

## FR-17 — Mencetak Riwayat

**Prioritas:** Must Have  
**Aktor:** Juru Kunci

Juru Kunci dapat memfilter riwayat berdasarkan Pengamal dan rentang tanggal, kemudian mencetak menggunakan halaman print atau Dompdf.

### Acceptance Criteria

1. Laporan cetak sesuai filter.
2. Tampilan cetak tidak menyertakan navigasi yang tidak perlu.
3. Pengamal tidak dapat mencetak laporan seluruh anggota.

## FR-18 — Validasi Formulir

**Prioritas:** Must Have  
**Aktor:** Sistem

Semua field yang relevan divalidasi di server; validasi frontend menjadi pelengkap saja.

### Acceptance Criteria

1. Field wajib tidak boleh kosong.
2. Email, kode khodam, dan nama kategori diperiksa keunikannya sesuai ketentuan.
3. Level kekuatan 1–5.
4. Foreign key harus mengacu ke data valid.
5. File diperiksa tipe dan ukuran.
6. Error ditampilkan per field dan data tidak valid tidak disimpan.

## FR-19 — Database Migration

**Prioritas:** Must Have  
**Aktor:** Developer

Migration dibuat untuk `users`, `profiles`, `kategori`, `khodam`, `kategori_khodam`, dan `pemanggilan`.

### Acceptance Criteria

1. Migration berjalan pada database kosong.
2. Foreign key dan unique constraint sesuai ERD.
3. `tgl_pelepasan` nullable saat aktif.
4. Rollback mengikuti urutan dependensi.

## FR-20 — Database Seeder

**Prioritas:** Must Have  
**Aktor:** Developer

Seeder membuat satu Juru Kunci, tiga Pengamal beserta profil, enam kategori, delapan khodam, dan relasi kategori.

### Acceptance Criteria

1. Role seed benar dan password di-hash.
2. Setiap akun memiliki satu profil.
3. Kode khodam unik; dua Macan Putih memakai kode berbeda.
4. Seeder dapat dijalankan untuk menyiapkan demo secara konsisten.

## FR-21 — README Project

**Prioritas:** Must Have  
**Aktor:** Tim pengembang

README memuat nama kelompok, nama tim, nama project, daftar fitur, screenshot skema database, dan video demo.

### Acceptance Criteria

1. Semua komponen wajib tersedia.
2. Screenshot skema database terbaca.
3. Video demo dapat diakses penilai.
4. README menyertakan teknologi dan instruksi instalasi, migration, serta seeder.
5. Kredensial demo tidak menggunakan kredensial produksi.

---

# 4. Aturan Bisnis

## BR-01 — Maksimal Dua Pemanggilan Aktif

Setiap Pengamal maksimal memiliki dua pemanggilan berstatus aktif. Sistem menghitung transaksi aktif, bukan seluruh riwayat.

**Pesan sistem:** “Ragamu sudah menampung 2 khodam, lepaskan salah satu dulu.”

## BR-02 — Satu Unit untuk Satu Pengamal

Unit dengan pemanggilan aktif tidak dapat dipinjam orang lain. Pemeriksaan dan penyimpanan harus aman terhadap permintaan bersamaan.

**Pesan sistem:** “Khodam sedang bersemayam di raga lain.”

## BR-03 — Jatuh Tempo Lima Hari

```text
tgl_jatuh_tempo = tgl_panggil + 5 hari
```

Hari kelima masih termasuk masa peminjaman; pelepasan pada tanggal jatuh tempo tidak dikenakan denda.

## BR-04 — Mahar Keterlambatan

```text
mahar = jumlah_hari_terlambat × tarif_per_hari
```

Jumlah hari adalah selisih tanggal kalender antara tanggal pelepasan dan jatuh tempo, dengan nilai minimum nol.

## BR-05 — Tarif Mahar

Tarif awal Rp5.000 per hari per unit dan disimpan pada konfigurasi aplikasi. Nilai mahar transaksi selesai tetap tersimpan sebagai nilai historis.

## BR-06 — Pelepasan oleh Juru Kunci

Hanya role `juru_kunci` yang dapat memproses pelepasan. Pengamal tidak boleh melepas sendiri; transaksi selesai tidak dapat diproses ulang.

## BR-07 — Kode Khodam Unik

Kode wajib unik, sedangkan nama boleh sama. Pencarian nama dapat menampilkan beberapa unit dengan kode berbeda.

## BR-08 — Profil Satu-ke-Satu

Setiap akun memiliki satu profil yang dibuat otomatis. `profiles.user_id` memiliki unique constraint.

---

# 5. Rancangan Halaman dan Antarmuka

## 5.1 Halaman Umum

### Login

Logo KhodamKu, field email dan password, tombol login, serta pesan validasi.

### Katalog Khodam

Pencarian nama, filter kategori, kartu khodam, kode, level, badge ketersediaan, dan tombol detail.

### Detail Khodam

Foto, nama, kode, asal, level, deskripsi, kategori, status, serta tombol Panggil untuk Pengamal jika tersedia.

## 5.2 Halaman Juru Kunci

| Halaman | Komponen/Fungsi Utama |
|---|---|
| Dashboard | Jumlah unit, tersedia, sedang bersemayam, pemanggilan aktif, pemanggilan terlambat, dan daftar jatuh tempo. |
| Kelola Khodam | Daftar, tambah, detail, edit, hapus/nonaktifkan, pencarian, pilih banyak kategori. |
| Kelola Kategori | Daftar, tambah, edit, hapus kategori. |
| Kelola Pengamal | Daftar, tambah akun, edit data akun/profil sesuai izin, hapus/nonaktifkan. |
| Pemanggilan Aktif | Semua transaksi aktif, Pengamal, kode khodam, jatuh tempo, status keterlambatan, tombol Pelepasan. |
| Buku Catatan Gaib | Riwayat semua anggota, filter Pengamal/tanggal/status, detail, tombol Cetak. |

## 5.3 Halaman Pengamal

| Halaman | Komponen/Fungsi Utama |
|---|---|
| Dashboard | Pemanggilan aktif, sisa waktu, jatuh tempo, estimasi mahar. |
| Pemanggilan Saya | Daftar transaksi aktif sendiri; tidak ada tombol pelepasan. |
| Riwayat Saya | Riwayat pemanggilan milik sendiri. |
| Profil | Ubah nomor HP, alamat, tanggal lahir, weton, dan foto. |

**Contoh pesan UI:**

- “Kontrak gaib berakhir 2 hari lagi.”
- “Kontrak gaib telah melewati jatuh tempo. Segera hubungi Juru Kunci untuk proses pelepasan.”

---

# 6. Validasi Data

Validasi utama harus dilakukan pada sisi server menggunakan mekanisme Laravel. Validasi di antarmuka hanya menjadi pelengkap.

| Form | Field | Aturan Validasi |
|---|---|---|
| Login | Email | Wajib; format email valid. |
| Login | Password | Wajib; kredensial harus cocok. |
| Profil | Nomor HP | Validasi format dan panjang; wajib jika ditetapkan wajib. |
| Profil | Alamat | Wajib jika ditetapkan wajib. |
| Profil | Tanggal lahir | Tanggal valid; nullable jika opsional. |
| Profil | Weton | Mengikuti pilihan/format aplikasi. |
| Profil | Foto | Opsional; tipe gambar dan ukuran dibatasi. |
| Khodam | Kode khodam | Wajib, unik. |
| Khodam | Nama | Wajib; nama duplikat diperbolehkan. |
| Khodam | Asal/Deskripsi | Sesuai ketentuan field pada form. |
| Khodam | Level kekuatan | Wajib, bilangan bulat 1–5. |
| Khodam | Foto | Opsional; tipe dan ukuran valid. |
| Khodam | Kategori | ID kategori harus tersedia; pilihan mengikuti aturan form. |
| Kategori | Nama | Wajib, unik. |
| Kategori | Deskripsi | Opsional atau wajib sesuai desain form. |
| Akun Pengamal | Nama | Wajib. |
| Akun Pengamal | Email | Wajib, format valid, unik. |
| Akun Pengamal | Password | Wajib saat pembuatan; disimpan dalam hash. |
| Akun Pengamal | Role | Ditetapkan sistem sebagai `pengamal`. |
| Pemanggilan | User dan khodam | User harus role Pengamal; khodam harus tersedia. |
| Pemanggilan | Tanggal/status/mahar | Ditetapkan sistem, bukan input bebas pengguna. |
| Pelepasan | Transaksi | Harus ada dan berstatus aktif. |
| Pelepasan | Aktor | Harus role `juru_kunci`. |
| Pelepasan | Tanggal | Ditetapkan sistem dan tidak mendahului tanggal panggil. |
| Pelepasan | Mahar/status | Dihitung/ditetapkan sistem. |

---

# 7. Rancangan Database

Database mengikuti ERD dan memiliki enam tabel inti. Semua tabel menggunakan primary key `id` serta `created_at` dan `updated_at` bawaan Laravel.

## Entity Relationship Diagram (ERD)

![ERD KhodamKu](ERD.png)

> Pastikan file gambar ERD tersedia di `docs/ERD_KhodamKu.png`. Jika lokasi atau nama file berbeda, sesuaikan path gambar di atas.

## 7.1 Tabel `users`

| Kolom | Tipe Konseptual | Ketentuan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `name` | VARCHAR | Wajib |
| `email` | VARCHAR | Wajib, unique |
| `password` | VARCHAR | Wajib, hash |
| `role` | VARCHAR/ENUM | `juru_kunci` atau `pengamal` |
| `created_at` / `updated_at` | TIMESTAMP | Bawaan Laravel |

## 7.2 Tabel `profiles`

| Kolom | Tipe Konseptual | Ketentuan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `user_id` | BIGINT | Foreign key, unique |
| `no_hp` | VARCHAR | Sesuai validasi |
| `alamat` | TEXT | Sesuai validasi |
| `tanggal_lahir` | DATE | Nullable jika opsional |
| `weton` | VARCHAR | Sesuai rancangan |
| `foto` | VARCHAR | Nullable |
| `created_at` / `updated_at` | TIMESTAMP | Bawaan Laravel |

## 7.3 Tabel `kategori`

| Kolom | Tipe Konseptual | Ketentuan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `nama` | VARCHAR | Wajib, unique |
| `deskripsi` | TEXT | Sesuai validasi |
| `created_at` / `updated_at` | TIMESTAMP | Bawaan Laravel |

## 7.4 Tabel `khodam`

| Kolom | Tipe Konseptual | Ketentuan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `kode_khodam` | VARCHAR | Wajib, unique |
| `nama` | VARCHAR | Wajib, boleh duplikat |
| `asal` | VARCHAR | Sesuai form |
| `level_kekuatan` | TINYINT/INTEGER | Wajib, 1–5 |
| `deskripsi` | TEXT | Sesuai form |
| `foto` | VARCHAR | Nullable |
| `created_at` / `updated_at` | TIMESTAMP | Bawaan Laravel |

## 7.5 Tabel `kategori_khodam`

| Kolom | Tipe Konseptual | Ketentuan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `khodam_id` | BIGINT | Foreign key |
| `kategori_id` | BIGINT | Foreign key |
| `created_at` / `updated_at` | TIMESTAMP | Bawaan Laravel |
| Unique composite | `khodam_id` + `kategori_id` | Tidak boleh duplikat |

## 7.6 Tabel `pemanggilan`

| Kolom | Tipe Konseptual | Ketentuan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `user_id` | BIGINT | Foreign key ke `users` |
| `khodam_id` | BIGINT | Foreign key ke `khodam` |
| `tgl_panggil` | DATE | Wajib |
| `tgl_jatuh_tempo` | DATE | Wajib |
| `tgl_pelepasan` | DATE | Nullable saat aktif |
| `mahar` | DECIMAL | Default 0 |
| `status` | VARCHAR/ENUM | `aktif` atau `dilepas` |
| `created_at` / `updated_at` | TIMESTAMP | Bawaan Laravel |

## 7.7 Relasi Antartabel

1. `users` 1:1 `profiles`.
2. `users` 1:N `pemanggilan`.
3. `khodam` 1:N `pemanggilan`.
4. `khodam` N:N `kategori` melalui `kategori_khodam`.

Status ketersediaan khodam dihitung dari keberadaan transaksi aktif. Foreign key menjaga integritas; data yang memiliki transaksi terkait tidak boleh dihapus sembarangan.

---

# 8. Ketentuan Teknis Implementasi

## 8.1 Teknologi

1. Backend: Laravel.
2. Frontend: Blade.
3. Autentikasi: Laravel Breeze.
4. Database: MySQL.
5. Skema: Laravel Migration.
6. Data awal: Laravel Seeder.
7. Cetak: halaman print dengan `window.print()` atau Dompdf.

## 8.2 Struktur Pemrosesan

Alur yang direncanakan:

`Request → Validation → Controller → Service → Repository → Model → View/Response`

1. Request/validasi menangani pemeriksaan input.
2. Controller mengatur alur permintaan HTTP.
3. Service menangani aturan bisnis.
4. Repository mengabstraksi akses data jika diwajibkan.
5. Model merepresentasikan entitas dan relasi.
6. View menampilkan antarmuka Blade.

Kebutuhan penggunaan Repository perlu dikonfirmasi kepada trainer jika belum menjadi ketentuan wajib.

## 8.3 Middleware dan Otorisasi

1. `auth` untuk semua halaman internal.
2. Middleware role untuk halaman Juru Kunci.
3. Pemeriksaan kepemilikan untuk profil dan transaksi Pengamal.
4. Otorisasi wajib dilakukan di server.

## 8.4 Transaksi Database

Proses pemanggilan harus memeriksa ketersediaan unit dan batas dua pemanggilan aktif secara atomik. Gunakan transaksi database dan locking yang sesuai untuk mencegah dua permintaan bersamaan meminjam unit yang sama.

Proses pelepasan harus menyimpan status, tanggal pelepasan, dan mahar secara konsisten.

## 8.5 Konfigurasi Mahar

Tarif awal adalah Rp5.000 per hari per unit dan disimpan pada konfigurasi aplikasi, bukan ditulis berulang pada controller atau view.

## 8.6 Keamanan Dasar

1. Password di-hash.
2. Autentikasi dan otorisasi server-side.
3. Validasi input server-side.
4. Pembatasan akses data berdasarkan role dan kepemilikan.
5. Perlindungan CSRF pada formulir yang mengubah data.
6. Validasi tipe dan ukuran file.
7. Riwayat transaksi dilindungi dari perubahan tanpa hak.

---

# 9. Data Seed untuk Demonstrasi

## 9.1 Akun

1. Satu akun Juru Kunci dengan role `juru_kunci`.
2. Tiga akun Pengamal dengan role `pengamal`.
3. Setiap akun memiliki profil.
4. Password seed disimpan dalam bentuk hash; kredensial demo didokumentasikan secara aman.

## 9.2 Kategori

1. Penjaga Rumah
2. Penglaris Dagangan
3. Pelindung Ujian
4. Kewibawaan
5. Penolak Bala
6. Pencari Jodoh

## 9.3 Data Khodam

| Kode Khodam | Nama | Level | Kategori |
|---|---|---:|---|
| `KHD-MCP-001` | Macan Putih | 5 | Penjaga Rumah; Kewibawaan |
| `KHD-MCP-002` | Macan Putih | 4 | Penjaga Rumah; Kewibawaan |
| `KHD-HRM-001` | Harimau Sumatra | 4 | Kewibawaan; Penolak Bala |
| `KHD-KBJ-001` | Kakek Berjubah Putih | 4 | Pelindung Ujian; Penolak Bala |
| `KHD-NGH-001` | Naga Hijau | 5 | Penglaris Dagangan |
| `KHD-KCO-001` | Kucing Oren Barbar | 3 | Penjaga Rumah |
| `KHD-KDP-001` | Kulkas Dua Pintu | 2 | Penglaris Dagangan |
| `KHD-TPN-001` | Tutup Panci | 1 | Pencari Jodoh |

Dua unit Macan Putih sengaja menggunakan nama yang sama dan kode berbeda untuk menguji BR-07.

---

# 10. Kebutuhan Nonfungsional

## NFR-01 — Kemudahan Penggunaan

Antarmuka mudah dipahami. Istilah tematik boleh digunakan, tetapi tanggal jatuh tempo, status, dan nominal mahar harus jelas.

## NFR-02 — Konsistensi Data

Sistem menjaga konsistensi transaksi, ketersediaan khodam, profil, dan riwayat.

## NFR-03 — Keamanan

Autentikasi, otorisasi, validasi server, hash password, dan pembatasan akses data diterapkan.

## NFR-04 — Kemudahan Pemeliharaan

Kode konsisten dan aturan bisnis utama ditempatkan pada Service agar mudah diuji dan tidak terduplikasi.

## NFR-05 — Dokumentasi

Project dilengkapi README, instruksi instalasi, skema database, dan video demo yang dapat diakses penilai.

---

# 11. User Acceptance Testing (UAT)

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| UAT-01 | Login dengan kredensial benar | Masuk ke dashboard sesuai role. |
| UAT-02 | Login dengan password salah | Login ditolak dan pesan error tampil. |
| UAT-03 | Akses halaman internal tanpa login | Dialihkan ke halaman login. |
| UAT-04 | Pengamal membuka CRUD admin | Akses ditolak. |
| UAT-05 | Membuat akun pengguna | Akun dan satu profil dibuat. |
| UAT-06 | Membuat profil kedua untuk user yang sama | Ditolak oleh validasi/constraint. |
| UAT-07 | Mengubah profil sendiri | Perubahan tersimpan. |
| UAT-08 | Mengubah profil pengguna lain | Akses ditolak. |
| UAT-09 | Dua unit bernama sama dengan kode berbeda | Berhasil disimpan. |
| UAT-10 | Dua unit memakai kode sama | Ditolak. |
| UAT-11 | Satu khodam dihubungkan ke beberapa kategori | Relasi tersimpan. |
| UAT-12 | Mencari khodam berdasarkan nama | Hasil sesuai kata pencarian. |
| UAT-13 | Meminjam unit tersedia dengan batas terpenuhi | Transaksi aktif dibuat. |
| UAT-14 | Meminjam unit yang sedang dipinjam | Transaksi ditolak. |
| UAT-15 | Meminjam unit ketiga saat dua aktif | Transaksi ditolak. |
| UAT-16 | Pengamal melihat daftar pemanggilan | Hanya transaksi miliknya tampil. |
| UAT-17 | Pengamal memproses pelepasan | Akses ditolak. |
| UAT-18 | Pelepasan tepat waktu | Status dilepas, mahar Rp0. |
| UAT-19 | Pelepasan terlambat satu hari | Mahar Rp5.000 per unit. |
| UAT-20 | Juru Kunci melihat pemanggilan aktif | Semua transaksi aktif tampil. |
| UAT-21 | Juru Kunci melihat riwayat | Riwayat semua anggota tampil. |
| UAT-22 | Mencetak riwayat | Laporan dapat dicetak. |
| UAT-23 | Mengirim form dengan field wajib kosong | Validasi menolak data. |
| UAT-24 | Menjalankan migration pada database kosong | Semua tabel berhasil dibuat. |
| UAT-25 | Menjalankan seeder | Akun, profil, kategori, khodam, dan relasi tersedia. |

---

Dokumen ini menjadi acuan implementasi fitur KhodamKu. Perubahan kebutuhan atau aturan bisnis harus disepakati tim dan dicatat sebelum diterapkan.
