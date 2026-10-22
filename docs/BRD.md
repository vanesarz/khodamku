# **Business Requirements Document (BRD) \- KhodamKu**

## **1\. Ringkasan**

KhodamKu adalah aplikasi web untuk mengelola peminjaman "khodam" antara **Juru Kunci** (admin) dan **Pengamal** (anggota), sedangkan proses bisnisnya mengikuti sistem peminjaman unit pada umumnya: pendaftaran anggota, katalog unit, peminjaman, batas waktu, denda keterlambatan, pengembalian, dan pelaporan riwayat.

Sistem ini menggantikan pencatatan manual yang rawan tidak lengkap, sehingga Juru Kunci dapat mengetahui khodam mana yang sedang dipinjam, oleh siapa, sampai kapan, dan berapa denda yang harus dibayar. Proyek dikembangkan dengan Laravel sebagai tugas pelatihan dan sertifikasi pengembangan web, dengan ruang lingkup mengacu pada 19 ketentuan soal.

**Stakeholder utama:** Juru Kunci, Pengamal, dan tim pengembang.

**Hasil yang diharapkan:** seluruh peminjaman tercatat dalam satu sistem, aturan peminjaman ditegakkan otomatis, dan riwayat peminjaman dapat dicetak sebagai laporan.

## **2\. Latar Belakang Proyek**

Juru Kunci mengelola sejumlah khodam yang dapat dipinjam oleh Pengamal untuk berbagai kebutuhan, seperti menjaga rumah, melariskan dagangan, atau menghadapi ujian. Selama ini proses peminjaman dicatat secara manual sehingga muncul beberapa masalah.

**Kondisi saat ini (as-is):**

* Peminjaman dicatat di buku atau pesan singkat, sehingga data mudah hilang dan sulit dicari.  
* Juru Kunci tidak dapat langsung mengetahui khodam mana yang sedang dipinjam dan mana yang tersedia.  
* Batas jumlah dan lama peminjaman tidak terkontrol, sehingga satu Pengamal bisa menahan banyak khodam terlalu lama.  
* Denda keterlambatan dihitung manual dan sering terlewat.  
* Riwayat peminjaman sulit direkap menjadi laporan.

**Kondisi yang diharapkan (to-be):**

* Semua anggota, khodam, dan peminjaman tercatat dalam satu aplikasi web yang hanya dapat diakses setelah login.  
* Status khodam (tersedia atau sedang dipinjam) terlihat secara langsung.  
* Sistem menolak peminjaman yang melanggar aturan (lebih dari 2 khodam aktif atau khodam sedang dipinjam orang lain).  
* Tanggal jatuh tempo dan denda keterlambatan dihitung otomatis saat pengembalian.  
* Juru Kunci dapat melihat dan mencetak riwayat peminjaman kapan saja.

## **3\. Tujuan Bisnis**

| Kode | Tujuan bisnis | Indikator keberhasilan |
| :---- | :---- | :---- |
| BO-01 | Memusatkan pencatatan anggota, khodam, dan peminjaman | 100% peminjaman tercatat di sistem, tidak ada pencatatan di luar aplikasi |
| BO-02 | Menegakkan aturan peminjaman secara otomatis | Tidak ada Pengamal dengan lebih dari 2 khodam aktif; tidak ada khodam yang dipinjam dua orang sekaligus |
| BO-03 | Mengurangi keterlambatan pengembalian | Setiap peminjaman memiliki tanggal jatuh tempo; keterlambatan terdeteksi otomatis |
| BO-04 | Memastikan denda tercatat dengan benar | Denda dihitung otomatis untuk setiap pengembalian yang terlambat |
| BO-05 | Memudahkan pelaporan | Juru Kunci dapat mencetak riwayat peminjaman tanpa rekap manual |
| BO-06 | Menjaga keamanan akses data | Hanya pengguna yang login yang dapat mengakses sistem, sesuai hak akses perannya |

## **4\. Pemangku Kepentingan**

| Stakeholder | Peran | Kepentingan | Tanggung jawab |
| :---- | :---- | :---- | :---- |
| Juru Kunci | Admin sistem | Mengontrol stok khodam, peminjaman, dan denda | Mengelola data khodam, kategori, dan Pengamal; memproses pengembalian; mencetak riwayat |
| Pengamal | Anggota / pengguna | Meminjam khodam dengan mudah dan mengetahui batas waktunya | Meminjam sesuai aturan; mengembalikan melalui Juru Kunci; menjaga data profil |
| Tim pengembang | Pembuat sistem | Sistem sesuai kebutuhan dan lulus penilaian | Menyusun dokumen, membangun, menguji, dan mendokumentasikan aplikasi |
| Trainer | Penilai | Seluruh ketentuan soal terpenuhi | Menilai kelengkapan fitur, dokumen, dan demo |

## 

## **5\. Ruang Lingkup**

**In scope:**

* Autentikasi (login) dan pembagian hak akses Juru Kunci dan Pengamal.  
* Pengelolaan profil pengguna (satu profil per pengguna).  
* Pengelolaan data khodam, kategori, dan Pengamal oleh Juru Kunci.  
* Pencarian khodam berdasarkan nama.  
* Peminjaman khodam oleh Pengamal dengan batas jumlah dan batas waktu.  
* Pengembalian khodam oleh Juru Kunci, termasuk perhitungan denda keterlambatan.  
* Daftar khodam yang sedang dipinjam, sesuai hak akses masing-masing peran.  
* Riwayat peminjaman beserta fitur cetak.  
* Data awal (seed) dan dokumentasi README.

**Out of scope:**

* Pembayaran denda atau biaya sewa secara online.  
* Notifikasi otomatis melalui email, WhatsApp, atau SMS.  
* Peminjaman oleh Juru Kunci.  
* Aplikasi mobile native dan API untuk pihak ketiga.  
* Fitur reservasi atau antrean untuk khodam yang sedang dipinjam.

## **6\. Kebutuhan Fungsional**

Kebutuhan ditulis pada level bisnis. Detail tampilan, validasi per field, dan pesan sistem dijabarkan di PRD. Prioritas: **Must** \= wajib sesuai soal.

| Kode | Soal | Kebutuhan bisnis | Aktor | Prioritas |
| :---- | :---- | :---- | :---- | :---- |
| F-01 | 2 | Sistem membedakan dua peran pengguna: Juru Kunci dan Pengamal, dengan hak akses berbeda | Sistem | Must |
| F-02 | 3 | Pengguna harus login sebelum dapat mengakses seluruh fitur | Semua | Must |
| F-03 | 4 | Hanya Pengamal yang terdaftar yang dapat meminjam khodam | Pengamal | Must |
| F-04 | 5 | Setiap pengguna memiliki tepat satu profil | Semua | Must |
| F-05 | 6 | Pengguna dapat memperbarui data profilnya sendiri | Semua | Must |
| F-06 | 7 | Satu khodam dapat dikelompokkan ke lebih dari satu kategori | Juru Kunci | Must |
| F-07 | 8 | Khodam dengan nama sama dapat terdaftar lebih dari satu, dibedakan oleh kode khodam yang unik | Juru Kunci | Must |
| F-08 | 9 | Pengguna dapat mencari khodam berdasarkan nama | Semua | Must |
| F-09 | 10 | Juru Kunci dapat menambah, mengubah, dan menghapus data khodam, kategori, dan Pengamal | Juru Kunci | Must |
| F-10 | 11 | Pengamal hanya dapat meminjam maksimal 2 khodam dalam waktu bersamaan | Pengamal | Must |
| F-11 | 12 | Lama peminjaman maksimal 5 hari; keterlambatan dikenakan denda | Sistem | Must |
| F-12 | 13 | Pengembalian khodam hanya dapat diproses oleh Juru Kunci; Pengamal menghubungi Juru Kunci untuk mengembalikan | Juru Kunci | Must |
| F-13 | 14 | Juru Kunci dapat melihat seluruh khodam yang sedang dipinjam | Juru Kunci | Must |
| F-14 | 15 | Pengamal hanya dapat melihat khodam yang sedang ia pinjam | Pengamal | Must |
| F-15 | 16 | Juru Kunci dapat melihat dan mencetak riwayat peminjaman seluruh Pengamal | Juru Kunci | Must |
| F-16 | 17 | Setiap data yang dimasukkan harus divalidasi sebelum disimpan | Sistem | Must |
| F-17 | 18 | Struktur penyimpanan data dibuat sesuai kebutuhan sistem | Tim pengembang | Must |
| F-18 | 19 | Sistem memiliki data awal: akun Juru Kunci, kategori, dan daftar khodam | Tim pengembang | Must |
| F-19 | 1 | Proyek dilengkapi dokumentasi README: nama kelompok, nama tim, nama proyek, daftar fitur, gambar skema database, dan video demo | Tim pengembang | Must |

## 

##   **7\. Kebutuhan Non-fungsional**

| Kode | Aspek | Kebutuhan |
| :---- | :---- | :---- |
| NF-01 | Keamanan | Password disimpan dalam bentuk terenkripsi (hash),  halaman Juru Kunci tidak dapat diakses oleh Pengamal |
| NF-02 | Keamanan | Pengamal tidak dapat melihat atau mengubah data peminjaman dan profil milik pengguna lain |
| NF-03 | Integritas data | Kode khodam dan email pengguna tidak boleh duplikat, data peminjaman tidak hilang saat terjadi kesalahan input |
| NF-04 | Usability | Antarmuka berbahasa Indonesia, mudah dipahami, dan menampilkan pesan yang jelas saat terjadi kesalahan atau keberhasilan |
| NF-05 | Kompatibilitas | Dapat diakses melalui browser di desktop maupun perangkat mobile (responsif) |
| NF-06 | Performa | Halaman daftar dan pencarian khodam tampil dalam waktu kurang dari 3 detik untuk data skala pelatihan |
| NF-07 | Maintainability | Kode tersusun rapi dengan pemisahan logika bisnis dari controller, sehingga mudah dikembangkan |
| NF-08 | Dokumentasi | Tersedia README dan dokumen pendukung (BRD, Flowchart, ERD, PRD) |

## **8\. Aturan Bisnis**

| Kode | Aturan bisnis | Terkait |
| :---- | :---- | :---- |
| BR-01 | Satu Pengamal maksimal memiliki 2 peminjaman yang masih aktif (belum dikembalikan) | F-10 |
| BR-02 | Khodam yang sedang dipinjam tidak dapat dipinjam oleh Pengamal lain sampai dikembalikan | F-10, F-13 |
| BR-03 | Tanggal jatuh tempo ditetapkan 5 hari setelah tanggal peminjaman | F-11 |
| BR-04 | Jika khodam dikembalikan setelah tanggal jatuh tempo, denda \= jumlah hari terlambat × tarif denda | F-11, F-12 |
| BR-05 | Tarif denda keterlambatan sebesar Rp5.000 per hari (sementara, menunggu konfirmasi trainer) | F-11 |
| BR-06 | Hanya Juru Kunci yang dapat memproses pengembalian; Pengamal wajib menghubungi Juru Kunci | F-12 |
| BR-07 | Kode khodam bersifat unik, sedangkan nama khodam boleh sama | F-07 |
| BR-08 | Setiap pengguna otomatis memiliki satu profil saat akunnya dibuat | F-04 |

Dalam tema aplikasi, aturan ini dibahasakan sebagai: raga manusia hanya kuat menampung 2 khodam (BR-01), satu khodam hanya bisa bersemayam di satu raga (BR-02), kontrak gaib berlaku 5 hari (BR-03), dan keterlambatan dikenakan "mahar keterlambatan" (BR-04).

## **9\. Kebutuhan Data**

Garis besar data yang dikelola sistem. Struktur tabel, tipe data, dan relasi detail dijabarkan di ERD.

| Kelompok data | Informasi yang disimpan | Catatan |
| :---- | :---- | :---- |
| Pengguna | Nama, email, password, peran | Email unik; peran Juru Kunci atau Pengamal |
| Profil | Nomor HP, alamat, tanggal lahir, weton, foto | Satu profil untuk satu pengguna |
| Kategori | Nama kategori, deskripsi | Contoh: Penjaga Rumah, Penglaris Dagangan, Pelindung Ujian |
| Khodam | Kode khodam, nama, asal, level kekuatan, deskripsi | Kode unik, nama boleh sama, satu khodam bisa punya banyak kategori |
| Peminjaman | Pengamal, khodam, tanggal pinjam, tanggal jatuh tempo, tanggal kembali, denda, status | Status: aktif atau sudah dikembalikan |

**Data awal (seed):** 1 akun Juru Kunci, beberapa akun Pengamal beserta profil, 6 kategori, dan 8 khodam (termasuk dua khodam bernama sama dengan kode berbeda).

**Laporan:** riwayat peminjaman berisi nama Pengamal, kode dan nama khodam, tanggal pinjam, tanggal jatuh tempo, tanggal kembali, dan denda.

## 

## 

##  **10\. Kebutuhan Antarmuka**

**Antarmuka pengguna:**

* Aplikasi berbasis web yang diakses melalui browser, dengan tampilan responsif.  
* Tampilan dibedakan berdasarkan peran: Juru Kunci melihat menu pengelolaan data, pengembalian, dan riwayat; Pengamal melihat menu pencarian, peminjaman miliknya, dan profil.  
* Status khodam ditampilkan jelas: tersedia ("Menunggu Dipanggil") atau sedang dipinjam ("Sedang Bersemayam").  
* Pengamal dapat melihat sisa hari peminjaman dan perkiraan denda.

**Sistem:**

* Aplikasi terhubung ke satu database relasional (MySQL).  
* Tidak ada integrasi dengan sistem eksternal, payment gateway, atau API pihak ketiga.
