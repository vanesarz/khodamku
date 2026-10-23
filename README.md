# KhodamKu
### Sewa Khodam, Hidup Lebih Tenang.

KhodamKu adalah aplikasi web bertema peminjaman khodam fiktif yang dikemas dengan tampilan profesional dan sentuhan humor. Aplikasi ini dibuat untuk memenuhi kebutuhan proyek sertifikasi Web Developer, dengan fitur pengelolaan data khodam, pemanggilan, pelepasan, serta pencatatan riwayat transaksi.

> **Catatan:** Seluruh nama, deskripsi, dan kategori khodam dalam aplikasi ini bersifat fiktif dan digunakan untuk kebutuhan hiburan serta pembelajaran.

---

## Identitas Proyek

| Informasi | Keterangan |
|---|---|
| Nama Kelompok | `KhodamKu` |
| Nama Project | **KhodamKu** |
| Tagline | *Sewa khodam, hidup lebih tenang.* |
| Jenis Aplikasi | Aplikasi web peminjaman dan pengelolaan khodam fiktif |

## Anggota Tim

| No. | Nama Anggota | NIM |
|---:|---|---|
| 1 | `Vanesa Rizka Alfatihah` | `102022300121` |
| 2 | `Taufik Qurohman` | `102022300211` |
| 3 | `Ahmad Akmal Amran` | `102022300010` |

---

## Daftar Fitur

### 1. Autentikasi dan Hak Akses
- Login untuk mengakses halaman aplikasi.
- Dua peran pengguna: **Juru Kunci (Admin)** dan **Pengamal (Member)**.
- Pembatasan akses halaman dan tindakan berdasarkan peran.
- Setiap Pengamal memiliki satu profil yang terhubung dengan akun.

### 2. Katalog Khodam
- Menampilkan daftar khodam beserta informasi dan status ketersediaannya.
- Mencari khodam berdasarkan nama.
- Memfilter khodam berdasarkan kategori.
- Menampilkan detail khodam, termasuk kode unik, nama, asal, level kekuatan, deskripsi, kategori, dan ketersediaan.
- Mendukung nama khodam yang sama selama kode setiap unit berbeda.

### 3. Pengelolaan Data oleh Juru Kunci
- Menambah, melihat, mengubah, dan menghapus data khodam sesuai aturan sistem.
- Mengelola kategori khodam.
- Mengelola data anggota/Pengamal.
- Menghubungkan satu khodam dengan beberapa kategori.

### 4. Pemanggilan Khodam
- Pengamal dapat memanggil khodam yang tersedia.
- Setiap Pengamal dapat memiliki maksimal **dua pemanggilan aktif** secara bersamaan.
- Satu unit khodam tidak dapat dipanggil oleh lebih dari satu Pengamal pada waktu yang sama.
- Sistem mencatat tanggal pemanggilan dan tanggal jatuh tempo secara otomatis.
- Durasi pemanggilan maksimal **lima hari**.

### 5. Pelepasan Khodam
- Pelepasan diproses oleh Juru Kunci.
- Pengamal perlu menghubungi Juru Kunci untuk mengajukan pelepasan.
- Sistem menghitung mahar keterlambatan jika khodam dilepas setelah tanggal jatuh tempo.
- Tarif awal keterlambatan adalah **Rp5.000 per hari untuk setiap unit**.

### 6. Riwayat dan Dashboard
- Dashboard Juru Kunci menampilkan ringkasan data dan pemanggilan aktif.
- Pengamal hanya dapat melihat pemanggilan miliknya sendiri.
- Juru Kunci dapat melihat seluruh pemanggilan aktif.
- Juru Kunci dapat melihat dan mencetak **Buku Catatan Gaib** atau riwayat pemanggilan.

### 7. Profil dan Validasi
- Pengamal dapat melihat dan memperbarui profilnya sendiri.
- Formulir menerapkan validasi untuk kolom wajib dan format data.
- Sistem menampilkan pesan berhasil atau gagal sesuai hasil tindakan.

---

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| PHP | Bahasa pemrograman backend |
| Laravel | Framework backend |
| Next.js | Framework frontend |
| Laravel Breeze | Fitur awal autentikasi |
| MySQL | Basis data relasional |
| HTML, CSS, JavaScript | Struktur, tampilan, dan interaksi antarmuka |
| Dompdf atau fitur cetak browser | Pencetakan riwayat pemanggilan, sesuai implementasi akhir |

---

## Struktur Basis Data

Basis data inti KhodamKu terdiri dari enam tabel:

| Tabel | Fungsi |
|---|---|
| `users` | Menyimpan akun pengguna dan perannya |
| `profiles` | Menyimpan informasi profil setiap pengguna |
| `kategori` | Menyimpan kategori khodam |
| `khodam` | Menyimpan data unit khodam |
| `kategori_khodam` | Tabel pivot untuk relasi many-to-many antara khodam dan kategori |
| `pemanggilan` | Menyimpan transaksi pemanggilan, jatuh tempo, pelepasan, dan mahar keterlambatan |

### Relasi Utama
- `users` memiliki relasi one-to-one dengan `profiles`.
- `users` memiliki relasi one-to-many dengan `pemanggilan`.
- `khodam` memiliki relasi one-to-many dengan `pemanggilan`.
- `khodam` dan `kategori` memiliki relasi many-to-many melalui `kategori_khodam`.

### Screenshot Skema Database

Simpan screenshot ERD/skema database pada lokasi `docs/database-schema.png`, lalu pastikan file tersebut ikut dimasukkan ke repository.

![Skema Database KhodamKu](docs/database-schema.png)

---

## Persyaratan Sistem

Pastikan perangkat telah memasang:
- PHP yang kompatibel dengan versi Laravel pada proyek.
- Composer.
- Node.js dan npm.
- MySQL.
- Git.

> Gunakan versi PHP dan dependensi yang sesuai dengan `composer.json` dan dokumentasi versi Laravel yang digunakan pada repository.

## Cara Menjalankan Proyek

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY_GITLAB>
cd <NAMA_FOLDER_PROYEK>
```

Ganti placeholder dengan URL repository dan nama folder proyek yang benar.

### 2. Instal Dependensi Backend

```bash
composer install
```

### 3. Buat File Environment

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Atur Database

Buat database MySQL, misalnya `khodamku`, lalu sesuaikan konfigurasi berikut pada file `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=khodamku
DB_USERNAME=root
DB_PASSWORD=
```

Sesuaikan username dan password dengan konfigurasi MySQL lokal.

### 5. Jalankan Migration dan Seeder

```bash
php artisan migrate --seed
```

Seeder digunakan untuk membuat data awal seperti akun Juru Kunci, akun Pengamal, kategori, dan khodam sesuai konfigurasi proyek.

### 6. Instal Dependensi Frontend

```bash
npm install
npm run build
```

Untuk pengembangan lokal, jalankan:

```bash
npm run dev
```

### 7. Jalankan Aplikasi

```bash
php artisan serve
```

Akses alamat lokal yang ditampilkan Laravel, biasanya `http://127.0.0.1:8000`.

---

## Akun Demo

Akun demo dibuat melalui database seeder. Sesuaikan kredensial berikut dengan implementasi seeder terbaru sebelum README dikumpulkan.

| Peran | Email | Password |
|---|---|---|
| Juru Kunci | `juru.kunci@khodamku.test` | `[Isi password demo dari seeder]` |
| Pengamal | `[Email Pengamal dari seeder]` | `[Isi password demo dari seeder]` |

**Keamanan:** Kredensial ini hanya untuk lingkungan demo/lokal. Jangan gunakan password demo untuk akun produksi.

---

## Video Demo

Video demo sebaiknya memperlihatkan alur login, penelusuran katalog, pemanggilan khodam, pengelolaan data oleh Juru Kunci, proses pelepasan, serta pencetakan riwayat.

Simpan video pada lokasi `docs/demo-khodamku.mp4` jika ukuran repository memungkinkan, atau tambahkan tautan video yang dapat diakses penilai:

**Tautan video demo:** `[Tambahkan tautan Google Drive/YouTube]`

---

## Aturan Bisnis Utama

1. Pengamal hanya dapat memiliki maksimal dua pemanggilan aktif.
2. Unit khodam yang sedang dipanggil tidak dapat dipanggil oleh Pengamal lain.
3. Tanggal jatuh tempo ditetapkan lima hari setelah tanggal pemanggilan.
4. Mahar keterlambatan dihitung dari jumlah hari setelah tanggal jatuh tempo dikalikan tarif harian.
5. Tarif awal mahar keterlambatan adalah Rp5.000 per hari per unit.
6. Hanya Juru Kunci yang dapat memproses pelepasan khodam.
7. Kode khodam harus unik, tetapi nama khodam boleh sama.
8. Setiap akun memiliki tepat satu profil.

---

## Status Pengembangan

Perbarui checklist ini sesuai progres tim:

- [ ] Analisis kebutuhan (BRD)
- [ ] Flowchart dan ERD
- [ ] Product Requirements Document (PRD)
- [ ] Desain antarmuka
- [ ] Pengembangan frontend dan backend
- [ ] Pengujian UAT
- [ ] Manual book
- [ ] Screenshot skema database
- [ ] Video demo
- [ ] Dokumentasi proyek dan repository GitLab

---

## Lisensi dan Penggunaan

Proyek ini dikembangkan untuk keperluan pembelajaran dan sertifikasi Web Developer. Seluruh konten khodam merupakan konten fiktif untuk kebutuhan proyek.
