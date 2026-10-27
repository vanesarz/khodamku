# Business Requirements Document (BRD) - KhodamKu

| Atribut Dokumen | Informasi |
| :--- | :--- |
| **Nama Proyek** | **KhodamKu** (*Sewa Khodam, Hidup Lebih Tenang*) |
| **Kategori** | Tugas Pelatihan & Sertifikasi Web Developer |
| **Kelompok** | **Kelompok 11** |
| **Versi Dokumen** | **1.0 (Final - Konsolidasi)** |
| **Dokumen Terkait** | [PRD.md](PRD.md) · [Flowchart_ERD.md](Flowchart_ERD.md) · [UAT_Results.md](UAT_Results.md) · [Project_Documentation.md](Project_Documentation.md) |

---

## 1. Ringkasan Eksekutif

**KhodamKu** adalah sistem informasi persewaan unit berbasis web yang mentransformasi tren pop-culture *cek khodam* menjadi platform manajemen inventaris dan transaksi sewa yang terstruktur. Aplikasi ini menjembatani interaksi antara **Juru Kunci** (administrator penyedia unit) dan **Pengamal** (anggota penyewa). 

Secara proses bisnis, KhodamKu menerapkan siklus persewaan barang komersial: registrasi anggota, katalog unit, peminjaman terkontrol, batas waktu sewa, sanksi keterlambatan, pengembalian unit terverifikasi, dan pelaporan riwayat transaksi. Seluruh aspek fungsional dikembangkan untuk memenuhi secara menyeluruh 19 butir ketentuan spesifikasi sertifikasi pengembang web.

Dokumen BRD ini mendefinisikan kebutuhan dari perspektif bisnis (**WHY** dan **WHAT**), bertindak sebagai landasan kebutuhan sebelum diturunkan ke dalam spesifikasi produk dan teknis pada [PRD.md](PRD.md).

---

## 2. Latar Belakang & Analisis Masalah

Sebelum adanya sistem KhodamKu, pengelolaan persewaan khodam di padepokan Juru Kunci dijalankan secara manual (menggunakan buku catatan dan pesan instan informal). Hal ini menimbulkan kendala operasional yang dirangkum dalam analisis *As-Is* versus *To-Be*:

| Aspek Operasional | Kondisi Saat Ini (*As-Is*) | Kondisi Target (*To-Be*) | Nilai Tambah Bisnis |
| :--- | :--- | :--- | :--- |
| **Pencatatan Transaksi** | Tersebar di catatan kertas/chat, mudah hilang, dan sulit dilacak. | Terpusat dalam satu basis data web terenkripsi yang hanya dapat diakses setelah login. | Akurasi data 100% dan integritas riwayat transaksi terjamin. |
| **Visibilitas Stok Unit** | Juru Kunci tidak tahu secara instan unit mana yang sedang disewa atau tersedia. | Status ketersediaan unit teridentifikasi otomatis secara *real-time*. | Menghilangkan salah sewa atau unit menganggur. |
| **Penegakan Batasan Kuota** | Pengamal dapat meminjam unit tanpa batas jumlah dan durasi. | Sistem menolak otomatis peminjaman > 2 unit dan menetapkan batas waktu 5 hari. | Mencegah penimbunan unit oleh segelintir anggota. |
| **Perhitungan Denda** | Denda dihitung manual secara perkiraan dan sering terlewat ditagih. | Denda dihitung otomatis oleh sistem berdasarkan selisih hari kalender saat pengembalian. | Menghilangkan kebocoran penerimaan denda dan menjaga transparansi. |
| **Pelaporan Operasional** | Rekapitulasi bulanan memerlukan waktu lama dan rawan salah hitung. | Riwayat dapat difilter dan dicetak langsung dalam format dokumen siap cetak. | Efisiensi waktu administrasi dan mempermudah audit evaluasi. |

---

## 3. Tujuan Bisnis & Indikator Keberhasilan

| Kode | Tujuan Bisnis (*Business Objective*) | Indikator Keberhasilan (*KPI / Success Metric*) |
| :--- | :--- | :--- |
| **BO-01** | **Sentralisasi Data & Akses Aman** | 100% data akun, profil, katalog, dan peminjaman tercatat dalam sistem dengan proteksi otentikasi. |
| **BO-02** | **Otomatisasi Penegakan Aturan Sewa** | 0 kasus pelanggaran kuota (maksimal 2 khodam aktif/anggota) dan 0 kasus peminjaman ganda pada unit yang sama. |
| **BO-03** | **Pengendalian Durasi Peminjaman** | 100% peminjaman memiliki tanggal jatuh tempo pasti (5 hari kalender sejak peminjaman diajukan). |
| **BO-04** | **Transparansi Perhitungan Mahar Denda** | 100% keterlambatan pengembalian terhitung dendanya secara konsisten dan transparan (Rp5.000/hari terlambat). |
| **BO-05** | **Efisiensi Rekapitulasi & Pelaporan** | Juru Kunci dapat mencetak laporan riwayat peminjaman dalam hitungan detik tanpa rekap manual. |
| **BO-06** | **Integritas & Tata Kelola Data Multi-Peran** | Isolasi data total antar Pengamal; Juru Kunci memiliki kendali penuh atas master data dan proses pengembalian. |

---

## 4. Pemangku Kepentingan Bisnis (Stakeholders)

| Pemangku Kepentingan | Peran dalam Bisnis | Kepentingan Utama | Tanggung Jawab Operasional |
| :--- | :--- | :--- | :--- |
| **Juru Kunci** | Administrator Sistem | Menjaga ketersediaan unit, mengontrol peminjaman, memproses pengembalian, dan memantau denda. | Mengelola master data (khodam, kategori, pengamal), memproses pengembalian unit, dan mencetak laporan transaksi. |
| **Pengamal** | Anggota / Penyewa | Menemukan khodam yang sesuai kebutuhan, meminjam unit secara tertib, dan memantau masa sewa. | Mematuhi kuota maksimal sewa, mengembalikan unit tepat waktu melalui Juru Kunci, dan menjaga data profil diri. |
| **Tim Pengembang** | Konsultan & Pembuat Sistem | Menghasilkan produk berkualitas tinggi yang andal, aman, dan memenuhi seluruh spesifikasi uji. | Merancang arsitektur, membangun kode sumber, menguji sistem (automated & UAT), serta menyusun dokumentasi. |
| **Penilai / Trainer** | Asesor Sertifikasi | Memastikan seluruh 19 butir ketentuan soal terpenuhi sesuai standar industri. | Menilai kepatuhan fungsional, arsitektur teknis, kualitas dokumentasi, dan hasil demonstrasi aplikasi. |

---

## 5. Ruang Lingkup Bisnis

### 5.1 Cakupan Proyek (*In Scope*)
1. **Tata Kelola Akun & Hak Akses:** Otentikasi dua peran (Juru Kunci & Pengamal) dan pengelolaan data profil mandiri (1:1).
2. **Pengelolaan Master Data (CRUD):** Pengelolaan unit khodam, kategori (*many-to-many*), dan akun pengamal eksklusif oleh Juru Kunci.
3. **Katalog & Pencarian:** Penelusuran katalog unit khodam dengan filter kategori dan pencarian nama (mendukung nama sama dengan kode unik).
4. **Siklus Peminjaman Terkendali:** Pengajuan peminjaman oleh Pengamal dengan pembatasan kuota raga (maksimal 2) dan masa sewa 5 hari.
5. **Siklus Pengembalian Terverifikasi:** Pemrosesan pengembalian eksklusif oleh Juru Kunci dengan kalkulasi denda otomatis.
6. **Pemantauan & Audit:** Pemantauan transaksi aktif secara global oleh Juru Kunci dan secara personal oleh Pengamal.
7. **Buku Catatan Gaib & Pelaporan:** Rekapitulasi riwayat transaksi lengkap dengan fasilitas cetak dokumen laporan siap pakai.
8. **Paket Penyerahan Proyek:** Data awal (*seed*), pengujian (*UAT & Feature Test*), dan dokumentasi komprehensif.

### 5.2 Di Luar Cakupan (*Out of Scope*)
1. Pembayaran mahar/denda secara digital (*payment gateway* perbankan/e-wallet).
2. Pengiriman notifikasi otomatis eksternal melalui SMS, Email gateway, atau WhatsApp API.
3. Peminjaman unit khodam oleh akun ber-role Juru Kunci.
4. Pengiriman fisik atau ekspedisi unit khodam.
5. Pemesanan di muka (*pre-order* / reservasi antrean) untuk unit yang sedang bersemayam.

---

## 6. Kebutuhan Fungsional Bisnis (Pemetaan 19 Soal)

Kebutuhan fungsional bisnis dirumuskan berdasarkan 19 butir ketentuan soal sertifikasi. Rincian teknis, endpoint API, dan kriteria penerimaan dijabarkan lebih lanjut pada [PRD.md](PRD.md).

| Kode | No. Soal | Kebutuhan Fungsional Bisnis | Aktor | Referensi Aturan Bisnis |
| :--- | :---: | :--- | :--- | :---: |
| **F-01** | 2 | Sistem membedakan secara tegas 2 peran pengguna: Juru Kunci dan Pengamal, dengan wewenang yang berbeda. | Sistem | — |
| **F-02** | 3 | Pengguna wajib login sebelum dapat mengakses fitur operasional internal aplikasi. | Semua Pengguna | — |
| **F-03** | 4 | Hanya pengguna yang terdaftar resmi sebagai Pengamal yang memiliki hak mengajukan peminjaman. | Pengamal | [BR-01, BR-02](#8-aturan-bisnis-utama) |
| **F-04** | 5 | Setiap akun pengguna memiliki tepat satu profil terhubung (*One-to-One*). | Sistem | [BR-08](#8-aturan-bisnis-utama) |
| **F-05** | 6 | Pengguna memiliki wewenang untuk melihat dan memperbarui data profil pribadinya sendiri. | Semua Pengguna | [BR-08](#8-aturan-bisnis-utama) |
| **F-06** | 7 | Satu unit khodam dapat dikelompokkan ke dalam lebih dari satu kategori (*Many-to-Many*). | Juru Kunci | — |
| **F-07** | 8 | Khodam dengan nama yang sama dapat didaftarkan lebih dari satu, dibedakan melalui kode khodam unik. | Juru Kunci | [BR-07](#8-aturan-bisnis-utama) |
| **F-08** | 9 | Sistem menyediakan fungsi pencarian unit khodam berdasarkan nama. | Semua Pengguna | — |
| **F-09** | 10 | Juru Kunci berhak melakukan operasi CRUD penuh atas data Khodam, Kategori, dan akun Pengamal. | Juru Kunci | — |
| **F-10** | 11 | Sistem membatasi peminjaman maksimal 2 unit khodam aktif dalam waktu bersamaan untuk tiap Pengamal. | Pengamal | [BR-01](#8-aturan-bisnis-utama) |
| **F-11** | 12 | Masa peminjaman standar ditetapkan 5 hari kalender; pengembalian melewati batas waktu dikenakan denda. | Sistem | [BR-03, BR-04, BR-05](#8-aturan-bisnis-utama) |
| **F-12** | 13 | Pengembalian unit hanya dapat dieksekusi oleh Juru Kunci setelah dihubungi oleh Pengamal. | Juru Kunci | [BR-06](#8-aturan-bisnis-utama) |
| **F-13** | 14 | Juru Kunci dapat memantau seluruh transaksi peminjaman yang sedang aktif di padepokan. | Juru Kunci | — |
| **F-14** | 15 | Pengamal hanya diizinkan melihat daftar unit khodam yang sedang dipinjam oleh dirinya sendiri. | Pengamal | — |
| **F-15** | 16 | Juru Kunci dapat melihat rekapitulasi riwayat transaksi seluruh anggota dan mencetaknya sebagai laporan. | Juru Kunci | — |
| **F-16** | 17 | Setiap data masukan formulir wajib divalidasi oleh sistem sebelum disimpan ke basis data. | Sistem | — |
| **F-17** | 18 | Struktur basis data dirancang secara terstandarisasi untuk mendukung seluruh kebutuhan relasi sistem. | Tim Pengembang | — |
| **F-18** | 19 | Sistem dilengkapi data awal bawaan (*seed*) untuk kebutuhan demonstrasi dan verifikasi fitur. | Tim Pengembang | — |
| **F-19** | 1 | Proyek dilengkapi dokumentasi `README.md` terstruktur mencakup identitas tim, fitur, ERD, dan video demo. | Tim Pengembang | — |

---

## 7. Kebutuhan Non-fungsional Bisnis

| Kode | Dimensi Mutu | Pernyataan Kebutuhan Bisnis |
| :--- | :--- | :--- |
| **NF-01** | **Keamanan Data** | Kredensial kata sandi disimpan menggunakan enkripsi *one-way hash*; rute administrasi tidak dapat diterobos oleh Pengamal maupun pengguna tanpa login. |
| **NF-02** | **Privasi & Isolasi Data** | Sistem menjamin kerahasiaan data; seorang Pengamal tidak dapat melihat transaksi, riwayat, atau menyunting profil milik Pengamal lain. |
| **NF-03** | **Integritas Transaksi** | Kode khodam dan email pengguna wajib unik; pembatalan otomatis (*rollback*) diterapkan bila terjadi anomali saat penyimpanan transaksi. |
| **NF-04** | **Kemudahan Penggunaan (*Usability*)** | Antarmuka disajikan dalam Bahasa Indonesia yang komunikatif dengan tema mistis-komedi modern, responsif pada berbagai ukuran layar gawai. |
| **NF-05** | **Performa & Aksesibilitas** | Waktu respons pemuatan katalog dan pemrosesan transaksi berlangsung singkat (< 3 detik) pada beban normal pelatihan. |
| **NF-06** | **Keterlacakan (*Auditability*)** | Setiap transaksi peminjaman memiliki jejak historis permanen yang tidak dapat dimanipulasi setelah status selesai. |
| **NF-07** | **Kesiapan Audit Sertifikasi** | Tersedia dokumentasi pendukung lengkap (BRD, PRD, Flowchart, ERD, UAT, Manual Book) yang saling sinkron. |

---

## 8. Aturan Bisnis Utama (Single Source of Truth)

Aturan bisnis berikut merupakan kebijakan absolut yang mengikat seluruh alur kerja sistem KhodamKu:

| Kode Aturan | Pernyataan Kebijakan Bisnis | Justifikasi / Analogi Tematik |
| :--- | :--- | :--- |
| **BR-01** | **Batas Kuota 2 Unit Aktif**<br>Seorang Pengamal maksimal hanya boleh memiliki 2 transaksi peminjaman yang berstatus aktif dalam waktu bersamaan. Pengajuan unit ke-3 otomatis ditolak. | *Kapasitas spiritual wadah raga manusia maksimal hanya kuat menampung dua khodam sekaligus tanpa menimbulkan goncangan jiwa.* |
| **BR-02** | **Eksklusivitas Semayam Unit**<br>Unit khodam yang sedang dalam peminjaman aktif tidak dapat dipinjam oleh Pengamal lain hingga unit tersebut resmi dikembalikan. | *Satu entitas khodam hanya dapat bersemayam di satu raga manusia pada satu kurun waktu yang sama.* |
| **BR-03** | **Durasi Kontrak 5 Hari Kalender**<br>Batas waktu peminjaman dihitung otomatis tepat 5 hari kalender sejak peminjaman diajukan (`tgl_jatuh_tempo = tgl_panggil + 5 hari`). Hari ke-5 masih berstatus aman tanpa denda. | *Energi ikatan kontrak gaib standar bertahan selama 5 hari sebelum memudar dan membutuhkan pelepasan resmi.* |
| **BR-04** | **Sanksi Keterlambatan Proporsional**<br>Keterlambatan pengembalian melewati tanggal jatuh tempo dikenakan denda per hari kalender: `denda = jumlah_hari_terlambat × tarif_per_hari`. Jika dikembalikan tepat waktu, denda adalah Rp0. | *Keterlambatan pelepasan khodam menimbulkan ketidakstabilan energi yang harus ditebus dengan mahar keterlambatan.* |
| **BR-05** | **Tarif Denda Flat**<br>Tarif denda keterlambatan ditetapkan flat sebesar **Rp5.000 per hari per unit** dan dikelola melalui konfigurasi sentral sistem. | *Ketentuan tarif mahar resmi padepokan Juru Kunci.* |
| **BR-06** | **Verifikasi Pengembalian Otoritatif**<br>Pengembalian unit wajib diverifikasi dan diproses langsung oleh Juru Kunci. Pengamal tidak memiliki tombol pelepasan mandiri. | *Ritual pelepasan khodam membutuhkan keahlian spiritual khusus yang hanya dikuasai oleh Juru Kunci padepokan.* |
| **BR-07** | **Identifikasi Unit Berbasis Kode Unik**<br>Kode khodam bersifat mutlak unik dalam sistem. Nama khodam diizinkan sama (duplikat) untuk merefleksikan unit varian atau jenis yang sejenis. | *Nama entitas mistis bisa serupa di berbagai daerah, namun silsilah/kode stempel gaibnya tetap unik.* |
| **BR-08** | **Penyatuan Akun dan Profil (1:1)**<br>Setiap akun pengguna wajib memiliki tepat satu data profil yang dibuat otomatis pada saat registrasi akun. | *Satu entitas sukma (user) terhubung erat dengan satu wujud jasmani (profil).* |

---

## 9. Kebutuhan Data & Pelaporan Bisnis

### 9.1 Entitas Data Konseptual

| Entitas Bisnis | Deskripsi Kebutuhan Informasi | Hubungan Bisnis |
| :--- | :--- | :--- |
| **Pengguna (*Users*)** | Menyimpan identitas akun, alamat email unik, kredensial sandi terenkripsi, dan peran (*Juru Kunci* atau *Pengamal*). | Induk dari Profil dan Transaksi Peminjaman. |
| **Profil (*Profiles*)** | Menyimpan data personal pengguna: nomor telepon, alamat, tanggal lahir, weton Jawa, dan berkas foto. | Terhubung *One-to-One* (1:1) dengan Pengguna. |
| **Kategori (*Categories*)** | Mengelompokkan tuah/manfaat unit (misal: *Penjaga Rumah*, *Penglaris Dagangan*, *Kewibawaan*). | Terhubung *Many-to-Many* (N:M) dengan Khodam. |
| **Khodam (*Units*)** | Menyimpan master unit: kode unik, nama unit, asal daerah, level kekuatan (1–5), deskripsi, dan foto. | Terhubung ke Kategori (N:M) dan Transaksi Peminjaman (1:N). |
| **Peminjaman (*Transactions*)** | Mencatat riwayat peminjaman: peminjam, unit khodam, tgl panggil, tgl jatuh tempo, tgl pelepasan, denda, dan status (*aktif* / *dilepas*). | Menghubungkan Pengamal dengan Unit Khodam (1:N). |

### 9.2 Spesifikasi Dokumen Laporan Bisnis
Sistem wajib menyediakan laporan rekapitulasi **Buku Catatan Gaib** yang dapat difilter berdasarkan identitas Pengamal dan rentang tanggal transaksi, serta dapat dicetak langsung ke media kertas/PDF dengan informasi mencakup:
- Identitas peminjam (Nama & Email Pengamal).
- Identitas unit (Kode & Nama Khodam).
- Kronologi sewa (Tanggal Panggil, Tanggal Jatuh Tempo, Tanggal Pelepasan).
- Status akhir transaksi (*Selesai Tepat Waktu* / *Terlambat*).
- Akumulasi denda / mahar keterlambatan yang dibayarkan.

---

## 10. Batasan & Standar Antarmuka Bisnis

1. **Aksesibilitas Platform:** Sistem berupa aplikasi berbasis web modern yang dapat diakses melalui peramban (*web browser*) umum tanpa perlu instalasi aplikasi tambahan di sisi klien.
2. **Desain Adaptif:** Antarmuka harus ramah pengguna dan adaptif (*responsive layout*) untuk kenyamanan akses pada perangkat desktop maupun gawai bergerak (*mobile*).
3. **Pemisahan Tampilan Peran:** Antarmuka disesuaikan secara dinamis berdasarkan wewenang pengguna (menu administrasi dan tombol pelepasan hanya tampak pada Juru Kunci).
4. **Indikator Status Visual yang Tegas:** Status ketersediaan khodam wajib ditampilkan jelas menggunakan lencana (*badge*) tematik:
   - **Menunggu Dipanggil:** Unit siap dipinjam.
   - **Sedang Bersemayam:** Unit sedang dipinjam dan tidak dapat dipilih.
