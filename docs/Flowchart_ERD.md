# DOKUMENTASI FLOWCHART & ENTITY RELATIONSHIP DIAGRAM (ERD)
# KhodamKu: Sewa Khodam, Hidup Lebih Tenang

---

## 1. Pendahuluan

Dokumen ini mendokumentasikan rancangan arsitektur proses bisnis (*Business Process Flowchart*) dan rancangan skema basis data relasional (*Entity Relationship Diagram / ERD*) dari aplikasi **KhodamKu**. Dokumen ini menjadi jembatan visual dan logis antara kebutuhan bisnis (**BRD**), kebutuhan produk (**PRD**), serta implementasi teknis pada kode Laravel dan Next.js.

---

## 2. Diagram Alur Kerja Sistem (System Flowchart)

### 2.1 Visualisasi Alur Bisnis Peminjaman & Pengembalian Khodam

![Flowchart Sistem KhodamKu](Flowchart.png)

### 2.2 Diagram Alur Logika (Mermaid Diagram)

```mermaid
flowchart TD
    Start([START]) --> Login[Login ke Sistem]
    Login --> RoleCheck{Pemeriksaan Peran Pengguna}
    
    %% Alur Pengamal
    RoleCheck -->|Pengamal / User| DashPengamal[Dashboard Pengamal]
    DashPengamal --> CariKhodam[Pencarian & Pemilihan Khodam]
    CariKhodam --> AjukanPinjam[Ajukan Peminjaman Khodam]
    
    AjukanPinjam --> CheckQuota{Peminjaman aktif < 2?}
    CheckQuota -->|Tidak| TolakQuota[Peminjaman Ditolak: Melebihi kuota maksimal 2 khodam]
    TolakQuota --> DashPengamal
    
    CheckQuota -->|Ya| CheckAvail{Status Khodam Tersedia?}
    CheckAvail -->|Tidak| TolakAvail[Peminjaman Ditolak: Khodam sedang bersemayam]
    TolakAvail --> CariKhodam
    
    CheckAvail -->|Ya| SimpanPinjam[Simpan Peminjaman & Tetapkan Jatuh Tempo 5 Hari]
    SimpanPinjam --> UpdateStatusPinjam[Perbarui Status Khodam: Sedang Bersemayam]
    UpdateStatusPinjam --> PinjamAktif[Peminjaman Aktif Berjalan]
    
    PinjamAktif --> HubungiAdmin[Pengamal Menghubungi Juru Kunci untuk Pengembalian]
    
    DashPengamal --> KelolaProfil[Kelola Profil Pribadi]
    DashPengamal --> LihatPinjam[Lihat Khodam yang Sedang Dipinjam]
    
    %% Alur Juru Kunci
    RoleCheck -->|Juru Kunci / Admin| DashAdmin[Dashboard Juru Kunci]
    DashAdmin --> KelolaMaster[Kelola Master Data: Khodam, Kategori, Pengamal]
    DashAdmin --> PantauSemua[Pantau Seluruh Khodam yang Dipinjam]
    DashAdmin --> CetakRiwayat[Lihat & Cetak Riwayat Peminjaman]
    
    HubungiAdmin --> ProsesKembali[Proses Pengembalian Khodam]
    DashAdmin --> ProsesKembali
    
    ProsesKembali --> CheckJatuhTempo{Tanggal Kembali > Jatuh Tempo?}
    CheckJatuhTempo -->|Ya| HitungDenda["Hitung Denda: Hari Terlambat x Rp5.000"]
    CheckJatuhTempo -->|Tidak| DendaNol[Denda = Rp0]
    
    HitungDenda --> SimpanKembali[Simpan Data Pengembalian & Catat Denda]
    DendaNol --> SimpanKembali
    
    SimpanKembali --> UpdateStatusBebas[Perbarui Status Khodam: Menunggu Dipanggil]
    UpdateStatusBebas --> UpdateRiwayat[Riwayat Peminjaman Diperbarui]
    
    KelolaProfil --> End([END])
    LihatPinjam --> End
    KelolaMaster --> End
    PantauSemua --> End
    CetakRiwayat --> End
    UpdateRiwayat --> End
```

### 2.3 Analisis Tahapan Logika Alur Bisnis

1. **Autentikasi & Pemeriksaan Peran:**
   - Semua aktor wajib melewati gerbang login terpusat.
   - Sistem membaca atribut `role` dari pengguna: jika `admin` diarahkan ke ekosistem Juru Kunci, jika `pengamal` diarahkan ke ekosistem Pengamal.
2. **Penegakan Batasan Kuota Peminjaman (BR-01):**
   - Raga seorang pengamal dibatasi secara ketat hanya dapat menampung maksimal 2 pemanggilan khodam aktif secara bersamaan.
   - Jika kuota sudah mencapai 2 unit, pengajuan pemanggilan ketiga langsung digugurkan oleh sistem.
3. **Pemeriksaan Ketersediaan Khodam (BR-02):**
   - Sistem memastikan khodam yang dipilih tidak sedang terikat (*Sedang Bersemayam*) pada pengamal lain.
4. **Pencatatan Transaksi & Durasi Kontrak (BR-03):**
   - Setelah validasi lolos, transaksi pemanggilan disimpan dengan tanggal panggil hari ini dan tanggal jatuh tempo otomatis $5\text{ hari}$ ke depan.
5. **Eksklusivitas Pengembalian oleh Admin (BR-06):**
   - Pengamal tidak memiliki otoritas melepas khodam secara mandiri. Pengamal menghubungi Juru Kunci via integrasi kontak.
6. **Perhitungan Denda Otomatis (BR-04, BR-05):**
   - Saat Juru Kunci memproses pelepasan, sistem membandingkan tanggal pengembalian aktual terhadap tanggal jatuh tempo.
   - Jika melewati jatuh tempo: $\text{Denda} = \text{Hari Terlambat} \times \text{Rp5.000}$.
   - Khodam yang telah dilepaskan otomatis berstatus *Menunggu Dipanggil* kembali.

---

## 3. Entity Relationship Diagram (ERD)

### 3.1 Skema Relasi Basis Data KhodamKu

![ERD KhodamKu](ERD.png)

### 3.2 Spesifikasi Relasi Antar Entitas (Mermaid ERD)

```mermaid
erDiagram
    users ||--|| profiles : "has exactly one (1:1)"
    users ||--o{ pemanggilans : "initiates (1:N)"
    khodams ||--o{ pemanggilans : "contracted in (1:N)"
    khodams }o--o{ kategoris : "classified by (N:M)"

    users {
        BIGINT id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password
        VARCHAR role "admin / pengamal"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    profiles {
        BIGINT id PK
        BIGINT user_id FK,UK
        VARCHAR no_hp
        TEXT alamat
        DATE tanggal_lahir
        VARCHAR weton
        VARCHAR foto
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    khodams {
        BIGINT id PK
        VARCHAR kode_khodam UK
        VARCHAR nama "duplikat boleh"
        VARCHAR asal
        INTEGER level_kekuatan "1-5"
        TEXT deskripsi
        VARCHAR foto
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    kategoris {
        BIGINT id PK
        VARCHAR nama UK
        TEXT deskripsi
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    kategori_khodam {
        BIGINT id PK
        BIGINT khodam_id FK
        BIGINT kategori_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    pemanggilans {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT khodam_id FK
        DATE tgl_panggil
        DATE tgl_jatuh_tempo
        DATE tgl_pelepasan
        DECIMAL mahar "default 0"
        VARCHAR status "aktif / dilepas"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
```

### 3.3 Penjelasan Relasi & Karakteristik Data

1. **`users` 1 : 1 `profiles`**
   - **Karakteristik:** Satu pengguna tepat memiliki satu profil pelengkap.
   - **Constraint:** Kolom `profiles.user_id` bertindak sebagai foreign key berindeks `UNIQUE`.
   - **Integritas:** Menggunakan `ON DELETE CASCADE` sehingga data profil terhapus otomatis jika pengguna dihapus.
2. **`users` 1 : N `pemanggilans`**
   - **Karakteristik:** Seorang pengamal dapat melakukan banyak transaksi pemanggilan khodam sepanjang waktu.
   - **Filter:** Digunakan untuk memfilter riwayat pribadi dan membatasi kuota maksimal 2 pemanggilan aktif.
3. **`khodams` 1 : N `pemanggilans`**
   - **Karakteristik:** Satu unit khodam dapat dipanggil dalam banyak riwayat transaksi peminjaman bergantian.
   - **Penentuan Status:** Status ketersediaan khodam dihitung dari transaksi pemanggilan yang berstatus `aktif`.
4. **`khodams` N : M `kategoris` (via `kategori_khodam`)**
   - **Karakteristik:** Satu unit khodam dapat memiliki banyak kategori tuah sekaligus, dan satu kategori dapat menaungi banyak khodam.
   - **Tabel Pivot:** `kategori_khodam` menyimpan pasangan `khodam_id` dan `kategori_id` dengan unique composite index `(khodam_id, kategori_id)`.
5. **Keunikan Kode vs Duplikasi Nama (Ketentuan 8 / BR-07):**
   - `khodams.kode_khodam` bersifat `UNIQUE` (wajib unik di seluruh sistem).
   - `khodams.nama` **tidak unik** (boleh duplikat), memungkinkan beberapa entitas memiliki nama sama (misal "Macan Putih") namun dibedakan secara tegas oleh kodenya.

---

**KhodamKu — Padepokan Spiritual Digital**  
*Kelompok 11 Web Development Certification Project · Hak Cipta © 2026*
