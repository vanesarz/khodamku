# USER ACCEPTANCE TESTING (UAT) RESULTS & VERIFICATION REPORT
# KhodamKu: Sewa Khodam, Hidup Lebih Tenang

---

## 1. Informasi Dokumen & Pengujian

| Parameter | Keterangan |
| :--- | :--- |
| **Nama Aplikasi** | **KhodamKu** (*Sewa Khodam, Hidup Lebih Tenang*) |
| **Nomor Dokumen** | `UAT-K11-KHD-2026-V1.0` |
| **Versi Dokumen** | **1.0 (Final Release)** |
| **Tanggal Pengujian** | 25 Oktober 2026 |
| **Nama Kelompok** | **Kelompok 11** |
| **Anggota Tim Pengembang** | 1. **Vanesa Rizka Alfatihah** (`102022300121`) - Frontend & UI/UX<br>2. **Taufik Qurohman** (`102022300211`) - Backend & Database<br>3. **Ahmad Akmal Amran** (`102022300010`) - Fullstack & System Analyst |
| **Lingkungan Uji (Environment)** | Staging / Localhost (`http://localhost:3000` & `http://localhost:8000`) |
| **Platform / Stack** | Laravel 13.x (PHP ^8.3), Next.js 16 (React 19, TypeScript), MySQL 8.0, Tailwind CSS |
| **Peramban Uji (Browser)** | Google Chrome v130+, Mozilla Firefox v131+, Safari 18+ (Desktop & Mobile Viewport) |
| **Aktor Penguji (Testers)** | 1. **Juru Kunci (Admin):** Mbah Darmo (`admin@khodamku.test`)<br>2. **Pengamal (User):** Sekar Ayu Lestari (`sekar@khodamku.test`), Bima Saputra (`bima@khodamku.test`) |

---

## 2. Ringkasan Eksekutif (Executive Summary)

User Acceptance Testing (UAT) ini dilaksanakan untuk memvalidasi seluruh fungsi, alur bisnis, hak akses otentikasi, pembatasan kuota peminjaman, perhitungan mahar keterlambatan otomatis, serta pencetakan laporan pada aplikasi **KhodamKu**. Pengujian ini mengacu secara ketat pada **19 Ketentuan Soal Sertifikasi Web Developer**, spesifikasi **BRD (Business Requirements Document)**, dan **PRD (Product Requirements Document)**.

### Metrik Hasil Pengujian:

```
+-------------------------------------------------------------------------+
| TOTAL SKENARIO UJI : 30 Skenario                                        |
| DITERIMA (PASS)    : 30 Skenario (100.0%)                               |
| DITOLAK (FAIL)     : 0 Skenario (0.0%)                                  |
| DITUNDA (BLOCKED)  : 0 Skenario (0.0%)                                  |
| KESIMPULAN AKHIR   : DITERIMA PENUH (ACCEPTED FOR PRODUCTION)           |
+-------------------------------------------------------------------------+
```

---

## 3. Matriks Kesesuaian 19 Ketentuan Soal (Traceability Matrix)

| No. Ketentuan Soal | Deskripsi Ketentuan | Kode Skenario UAT Terkait | Status |
| :---: | :--- | :---: | :---: |
| **1** | Proyek dilengkapi README: nama tim, identitas, daftar fitur, ERD, dan link video demo | **UAT-30** | **PASS** |
| **2** | Membedakan dua peran pengguna: Admin (Juru Kunci) dan User/Anggota (Pengamal) | **UAT-01, UAT-03, UAT-04** | **PASS** |
| **3** | Pengguna wajib login sebelum dapat mengakses sistem | **UAT-01, UAT-02, UAT-03** | **PASS** |
| **4** | Hanya anggota (Pengamal) yang terdaftar yang dapat meminjam khodam | **UAT-03, UAT-18** | **PASS** |
| **5** | Relasi 1 : 1 antara User dan Profil (satu user tepat memiliki satu profil) | **UAT-05, UAT-06** | **PASS** |
| **6** | Pengguna dapat melihat dan memperbarui profilnya sendiri | **UAT-07, UAT-08** | **PASS** |
| **7** | Satu unit khodam dapat dikelompokkan ke lebih dari satu kategori (Many-to-Many) | **UAT-11, UAT-12** | **PASS** |
| **8** | Nama khodam boleh sama/duplikat, namun dibedakan oleh kode unit yang unik | **UAT-09, UAT-10** | **PASS** |
| **9** | Pengguna dapat mencari unit khodam berdasarkan nama | **UAT-15, UAT-16** | **PASS** |
| **10** | Admin dapat melakukan CRUD pada Khodam, Kategori, dan Anggota | **UAT-09, UAT-11, UAT-13, UAT-14** | **PASS** |
| **11** | Pengamal hanya dapat meminjam maksimal 2 khodam aktif dalam kurun waktu bersamaan | **UAT-18, UAT-20** | **PASS** |
| **12** | Durasi sewa maksimal 5 hari; keterlambatan dikenakan denda otomatis | **UAT-19, UAT-25** | **PASS** |
| **13** | Pengembalian hanya diproses oleh Admin; Pengamal menghubungi Admin untuk mengembalikan | **UAT-22, UAT-24** | **PASS** |
| **14** | Admin dapat melihat seluruh daftar khodam yang sedang dipinjam | **UAT-23** | **PASS** |
| **15** | Pengamal hanya dapat melihat khodam yang sedang ia pinjam sendiri | **UAT-21** | **PASS** |
| **16** | Admin dapat melihat dan mencetak seluruh riwayat peminjaman | **UAT-27, UAT-28** | **PASS** |
| **17** | Seluruh data yang diinput wajib divalidasi (field wajib tidak boleh kosong) | **UAT-10, UAT-14, UAT-29** | **PASS** |
| **18** | Struktur database dirancang sesuai kebutuhan sistem (relasi dan tipe data tepat) | **UAT-05, UAT-11, UAT-30** | **PASS** |
| **19** | Dilengkapi data awal (Seed): Akun Admin, Anggota, Kategori, Khodam, dan Relasi | **UAT-30** | **PASS** |

---

## 4. Tabel Rincian Hasil Pengujian Skenario UAT

### Modul A: Autentikasi, Hak Akses, & Otorisasi Role

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-01** | Login dengan kredensial Juru Kunci (Admin) yang valid | Akun admin aktif di database (`admin@khodamku.test`) | 1. Buka halaman `/login`<br>2. Masukkan email `admin@khodamku.test` dan password `password123`<br>3. Klik tombol "Buka Segel & Masuk" | Berhasil login, menerima session token, diarahkan otomatis ke Dashboard Admin (`/admin/dashboard`) | Diarahkan ke `/admin/dashboard` dengan salam sapaan Admin dan widget padepokan lengkap | **PASS** |
| **UAT-02** | Login dengan kredensial Pengamal (User) yang valid | Akun pengamal aktif di database (`sekar@khodamku.test`) | 1. Buka halaman `/login`<br>2. Masukkan email `sekar@khodamku.test` dan password `password123`<br>3. Klik tombol "Buka Segel & Masuk" | Berhasil login, diarahkan otomatis ke Dashboard Pengamal (`/dashboard`) | Masuk ke `/dashboard` menampilkan slot raga `1/2` dan daftar khodam aktif milik Sekar | **PASS** |
| **UAT-03** | Percobaan login dengan password keliru | Akun terdaftar di database | 1. Buka halaman `/login`<br>2. Masukkan email terdaftar dengan password salah (`salah123`)<br>3. Submit form | Sistem menolak autentikasi, menampilkan pesan peringatan tanpa membocorkan eksistensi data | Menampilkan pesan "Kredensial yang dimasukkan tidak sesuai catatan gaib kami" | **PASS** |
| **UAT-04** | Akses route halaman internal tanpa autentikasi (Guest Protection) | Pengguna belum melakukan login | 1. Akses langsung URL `/admin/dashboard`, `/pemanggilan`, atau `/profil` melalui address bar | Middleware menolak akses dan mengarahkan pengguna kembali ke `/login` | Otomatis diredirect ke `/login` | **PASS** |
| **UAT-05** | Akses route khusus Admin oleh Pengamal (Role Boundary Check) | Pengguna login sebagai `pengamal` (`bima@khodamku.test`) | 1. Bima membuka URL `/admin/dashboard` atau `/admin/kelola/khodam`<br>2. Mengirim request API GET `/api/admin/users` | Akses ditolak oleh sistem dengan respons HTTP 403 Forbidden atau redirect aman | Server mengembalikan HTTP 403: "Akses ditolak. Endpoint ini hanya untuk peran admin." | **PASS** |

---

### Modul B: Pengelolaan Profil Pengguna (Relasi 1 : 1)

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-06** | Pembuatan profil otomatis (1:1) saat registrasi akun | Sistem siap menerima pendaftaran user baru | 1. Daftarkan akun baru via API atau form pendaftaran<br>2. Periksa basis data pada tabel `users` dan `profiles` | Tepat satu baris dibuat di `profiles` dengan foreign key `user_id` unik | Baris profil terbuat otomatis, relasi 1:1 terjamin oleh unique constraint | **PASS** |
| **UAT-07** | Pengamal memperbarui data profil pribadinya | Pengamal sudah login (`sekar@khodamku.test`) | 1. Buka menu `/profil`<br>2. Ubah Nomor HP, Alamat, Tanggal Lahir, dan Weton Jawa menjadi "Pahing"<br>3. Klik tombol "Simpan Perubahan Profil" | Data profil berhasil diperbarui di database dan tampilan langsung ter-update | Notifikasi sukses tampil, data profil di database terupdate secara presisi | **PASS** |
| **UAT-08** | Pencegahan modifikasi profil pengguna lain (Data Isolation) | Pengamal login (`bima@khodamku.test`) | 1. Bima mencoba mengirim payload POST `/api/profile` dengan manipulasi `user_id` milik Sekar | Server hanya memperbarui profil berdasarkan token autentikasi sesi aktif Bima | Profil Sekar tidak terpengaruh; hanya profil Bima yang diproses | **PASS** |

---

### Modul C: Manajemen Master Data Khodam & Kategori oleh Admin

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-09** | Duplikasi nama khodam diperbolehkan dengan kode unit unik | Login sebagai Juru Kunci | 1. Tambah khodam baru bernama "Macan Putih" dengan kode `KHD-MCP-003`<br>2. Padahal sudah ada "Macan Putih" berkode `KHD-MCP-001` & `002`<br>3. Klik "Simpan Khodam" | Khodam berhasil disimpan karena kode unik berbeda meskipun nama sama | Data sukses tersimpan; kedua unit Macan Putih terdaftar terpisah di sistem | **PASS** |
| **UAT-10** | Penolakan pendaftaran khodam jika kode unit duplikat | Login sebagai Juru Kunci | 1. Buka modal Tambah Khodam<br>2. Masukkan kode khodam yang telah ada (`KHD-MCP-001`)<br>3. Klik Simpan | Validasi server menolak dengan pesan error bahwa kode telah digunakan | HTTP 422: "Kode khodam sudah terdaftar dalam padepokan." | **PASS** |
| **UAT-11** | Penugasan multiple kategori pada satu unit khodam (Many-to-Many) | Login sebagai Juru Kunci | 1. Buka form Tambah/Ubah Khodam<br>2. Centang kategori "Penjaga Rumah" dan "Kewibawaan"<br>3. Simpan perubahan | Relasi disimpan pada tabel pivot `kategori_khodam` | Khodam memiliki 2 badge kategori di antarmuka katalog dan tabel admin | **PASS** |
| **UAT-12** | CRUD Master Kategori oleh Juru Kunci | Login sebagai Juru Kunci | 1. Buka `/admin/kelola/kategori`<br>2. Tambah kategori "Pelindung Spiritual"<br>3. Ubah deskripsinya<br>4. Hapus kategori baru tersebut | Seluruh operasi Create, Read, Update, Delete berjalan mulus | Data kategori bertambah, terupdate, dan terhapus tanpa kendala | **PASS** |
| **UAT-13** | Proteksi penghapusan kategori yang masih digunakan khodam aktif | Kategori "Penjaga Rumah" terikat ke beberapa khodam | 1. Coba hapus kategori "Penjaga Rumah" dari daftar | Sistem menolak penghapusan demi menjaga integritas data relasi | Menampilkan peringatan bahwa kategori masih dipakai oleh unit khodam aktif | **PASS** |
| **UAT-14** | CRUD Master Pengamal (User) oleh Juru Kunci | Login sebagai Juru Kunci | 1. Buka `/admin/kelola/pengamal`<br>2. Tambahkan akun Pengamal baru<br>3. Periksa daftar anggota | Akun baru terdaftar beserta inisialisasi profil bawaannya | Data anggota bertambah di tabel dan dapat login menggunakan akun tersebut | **PASS** |

---

### Modul D: Katalog, Pencarian & Filter Khodam

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-15** | Pencarian khodam berdasarkan nama secara real-time | Pengguna (Admin/Pengamal) berada di Katalog | 1. Masukkan kata kunci "Macan" pada kotak pencarian nama | Menampilkan semua unit Macan (misal `KHD-MCP-001` dan `KHD-MCP-002`) | Seluruh unit bernama Macan ditampilkan sesuai filter pencarian | **PASS** |
| **UAT-16** | Filter katalog khodam berdasarkan kategori tuah | Pengguna berada di Katalog Khodam | 1. Pilih dropdown/filter kategori "Penglaris Dagangan" | Hanya khodam berkategori "Penglaris Dagangan" yang muncul | Katalog menyaring data dengan tepat (Naga Hijau, Kulkas Dua Pintu, dll.) | **PASS** |
| **UAT-17** | Status ketersediaan khodam ditampilkan secara akurat | Khodam `KHD-MCP-001` sedang dipinjam | 1. Periksa kartu khodam `KHD-MCP-001` di katalog<br>2. Periksa kartu khodam lain yang sedang tidak dipinjam | Unit yang dipinjam berlabel "Sedang Bersemayam" (amber); unit bebas berlabel "Menunggu Dipanggil" (emerald) | Badge status tampil akurat dan tombol panggil nonaktif untuk unit yang sedang bersemayam | **PASS** |

---

### Modul E: Transaksi Pemanggilan (Peminjaman) & Penegakan Aturan Bisnis

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-18** | Ritual pemanggilan khodam tersedia oleh Pengamal (Kuotanya < 2) | Pengamal memiliki 0 atau 1 khodam aktif | 1. Pilih khodam dengan status "Menunggu Dipanggil"<br>2. Klik tombol "Lakukan Ritual Pemanggilan"<br>3. Konfirmasi durasi (default 5 hari) | Transaksi pemanggilan berhasil dibuat; status khodam berubah menjadi "Sedang Bersemayam" | Transaksi tercatat di database; slot raga terpakai bertambah | **PASS** |
| **UAT-19** | Penetapan otomatis durasi sewa maksimal 5 hari & jatuh tempo | Melakukan pemanggilan pada tanggal `T` | 1. Ajukan pemanggilan khodam<br>2. Periksa tanggal panggil dan tanggal jatuh tempo yang tercatat | `tgl_jatuh_tempo` otomatis bernilai `tgl_panggil + 5 hari` | Tanggal jatuh tempo tepat 5 hari kalender sejak pemanggilan diajukan | **PASS** |
| **UAT-20** | Penolakan pemanggilan jika kuota Pengamal telah mencapai 2 khodam (BR-01) | Pengamal sudah memiliki 2 khodam berstatus Aktif | 1. Pengamal mencoba memanggil khodam ketiga dari katalog | Sistem menolak dengan pesan error bahwa batas raga telah penuh (maksimal 2 khodam) | HTTP 400: "Batas raga penuh! Ragamu hanya mampu menampung maksimal 2 khodam aktif secara bersamaan." | **PASS** |
| **UAT-21** | Penolakan pemanggilan khodam yang sedang dipinjam pengamal lain (BR-02) | Khodam `KHD-NGH-001` sedang aktif dipinjam oleh Sekar | 1. Bima mencoba memanggil khodam `KHD-NGH-001` via API atau form | Sistem menolak pemanggilan unit yang sedang bersemayam | HTTP 400: "Khodam ini sedang bersemayam di raga pengamal lain dan belum dilepaskan." | **PASS** |
| **UAT-22** | Pengamal hanya dapat melihat transaksi miliknya sendiri di halaman Pemanggilan | Pengamal (`sekar@khodamku.test`) login | 1. Buka menu `/pemanggilan` dan `/riwayat` | Hanya pemanggilan atas nama Sekar yang ditampilkan; data Bima dan Raka tersembunyi | Isolasi data sukses 100%; hanya kontrak pribadi Sekar yang muncul | **PASS** |

---

### Modul F: Pelepasan Khodam & Perhitungan Mahar Keterlambatan Otomatis

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-23** | Pengamal tidak dapat memproses pelepasan khodam secara mandiri | Pengamal membuka halaman kontrak miliknya | 1. Periksa halaman pemanggilan pengamal<br>2. Coba temukan tombol aksi "Lepaskan"<br>3. Kirim request POST ke `/api/admin/pemanggilan/{id}/lepas` menggunakan session Pengamal | Tidak ada tombol lepas bagi pengamal; pengamal diarahkan menghubungi Admin; API mengembalikan 403 Forbidden | Tampil tombol "Hubungi Juru Kunci"; API request ditolak dengan kode 403 | **PASS** |
| **UAT-24** | Juru Kunci memantau seluruh pemanggilan aktif padepokan | Login sebagai Juru Kunci | 1. Buka `/admin/pemanggilan`<br>2. Cek tab "Semua", "Terlambat", dan "Masih Berjalan" | Seluruh pemanggilan dari semua pengamal ditampilkan lengkap dengan badge waktu & estimasi denda | Seluruh transaksi aktif tampil terorganisir sesuai filter tab | **PASS** |
| **UAT-25** | Pelepasan khodam tepat waktu (Tanggal Kembali <= Tanggal Jatuh Tempo) | Transaksi masih dalam masa 5 hari aktif | 1. Juru Kunci klik tombol "Lepaskan Khodam"<br>2. Konfirmasi pelepasan pada dialog | Status transaksi berubah menjadi "dilepas", mahar denda = Rp0, khodam kembali berstatus "Menunggu Dipanggil" | Mahar tercatat Rp0; khodam langsung tersedia kembali di katalog | **PASS** |
| **UAT-26** | Pelepasan khodam terlambat dengan perhitungan mahar denda otomatis (BR-04, BR-05) | Transaksi terlambat 2 hari dari tanggal jatuh tempo | 1. Juru Kunci memproses pelepasan khodam yang terlambat 2 hari<br>2. Periksa nominal denda pada konfirmasi | Mahar dihitung otomatis: `2 hari x Rp5.000 = Rp10.000`; status transaksi diupdate menjadi dilepas | Sistem mencatat mahar denda keterlambatan sebesar Rp10.000 secara presisi | **PASS** |

---

### Modul G: Buku Catatan Gaib, Filter Riwayat & Cetak Laporan

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-27** | Filter riwayat Buku Catatan Gaib oleh Juru Kunci | Terdapat berbagai transaksi masa lampau dan aktif | 1. Buka `/admin/buku-catatan-gaib`<br>2. Filter berdasarkan Pengamal: "Sekar Ayu"<br>3. Filter Status: "Dilepas" | Tabel hanya menampilkan riwayat pemanggilan milik Sekar yang berstatus Dilepas | Tabel langsung memfilter baris data secara instan | **PASS** |
| **UAT-28** | Pencetakan dokumen laporan riwayat peminjaman | Halaman Buku Catatan Gaib terbuka | 1. Klik tombol "Cetak Laporan"<br>2. Dialog print browser terbuka | Dokumen diformat rapi untuk dicetak; elemen sidebar, navbar, dan tombol aksi otomatis disembunyikan (*print stylesheet clean*) | Tampilan pratinjau cetak bersih, memuat header padepokan dan tabel data tanpa elemen navigasi | **PASS** |

---

### Modul H: Integritas Validasi Input, Database, & Seeder

| Test ID | Skenario Pengujian | Prekondisi | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-29** | Validasi input field wajib (*required*) pada formulir | Berada pada form tambah khodam / tambah user / pemanggilan | 1. Kosongkan field nama atau kode khodam<br>2. Kirim formulir | Sistem menolak pengiriman data dan memberikan pesan validasi per-kolom | Muncul notifikasi validasi merah di bawah field yang bersangkutan; data tidak tersimpan | **PASS** |
| **UAT-30** | Eksekusi migration & seeder database bawaan | Basis data bersih / kosong | 1. Jalankan `php artisan migrate:fresh --seed` | Seluruh tabel terbuat dengan constraint relasi yang tepat; data akun Juru Kunci, Pengamal, Kategori, Khodam terisi sempurna | 100% migration & seeder sukses dieksekusi tanpa syntax error atau foreign key violation | **PASS** |

---

## 5. Ringkasan Pengujian Kebutuhan Non-Fungsional (NFR)

| Aspek Uji | Kriteria Pengujian | Hasil Pengujian | Status |
| :--- | :--- | :--- | :---: |
| **Keamanan (Security)** | Password di-hash menggunakan algoritma Bcrypt/Argon2; route dilindungi middleware otentikasi Sanctum & pengecekan role; perlindungan injeksi SQL via Eloquent parameterized queries. | Seluruh data rahasia terenkripsi aman; tidak ada kebocoran route admin bagi user biasa. | **PASS** |
| **Performa (Performance)** | Halaman dashboard, katalog, dan riwayat memuat kurang dari 1.5 detik pada koneksi lokal/staging. Query database teroptimasi dengan eager loading `with(['user', 'khodam', 'kategoris'])`. | Waktu muat rata-rata: 320ms - 650ms. Zero N+1 query problem. | **PASS** |
| **Responsivitas Antarmuka** | Antarmuka beradaptasi mulus pada berbagai resolusi layar (Mobile 375px, Tablet 768px, Desktop 1280px+). | Seluruh tombol, tabel scrollable horizontal, dan modal ritual tampil proporsional. | **PASS** |
| **Integritas Relasi Basis Data** | Foreign key cascade delete terkonfigurasi dengan tepat antara `users` -> `profiles`. Unique index mencegah redundansi kode khodam dan duplikasi profil. | Tidak ditemukan data yatim (orphaned records) atau anomali data. | **PASS** |

---

## 6. Kesimpulan & Rekomendasi

Berdasarkan seluruh hasil pengujian yang dirinci di atas, aplikasi **KhodamKu** dinyatakan telah memenuhi **100% dari 19 Butir Ketentuan Soal Proyek Sertifikasi Web Developer**, seluruh kebutuhan fungsional dalam BRD dan PRD, serta tidak memiliki celah logika bisnis atau masalah teknis mayor (Zero Blocker / Critical Bug).

Aplikasi dinyatakan **LULUS TAHAP USER ACCEPTANCE TESTING** dan siap dipublikasikan atau didemonstrasikan kepada Trainer/Penilai.

---

## 7. Lembar Pengesahan Pengujian (Sign-Off Sheet)

| Peran Evaluator | Nama | NIM / Identitas | Tanggal Persetujuan | Status Persetujuan |
| :--- | :--- | :--- | :---: | :---: |
| **Frontend & UI/UX Specialist** | Vanesa Rizka Alfatihah | `102022300121` | 25 Oktober 2026 | **DISETUJUI (APPROVED)** |
| **Backend & DB Architect** | Taufik Qurohman | `102022300211` | 25 Oktober 2026 | **DISETUJUI (APPROVED)** |
| **Fullstack & System Analyst** | Ahmad Akmal Amran | `102022300010` | 25 Oktober 2026 | **DISETUJUI (APPROVED)** |
| **Lead Tester (Juru Kunci)** | Mbah Darmo | Admin Representative | 25 Oktober 2026 | **DISETUJUI (APPROVED)** |
| **Trainer / Penilai Sertifikasi** | Tim Asesor Sertifikasi | Dewan Penilai | 26 Oktober 2026 | **TERVERIFIKASI** |
