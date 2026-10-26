# Dokumentasi API Khodamku

## Daftar Isi

1. [Informasi Umum](#1-informasi-umum)
2. [Autentikasi](#2-autentikasi)
3. [Profil](#3-profil)
4. [Pengamal: Katalog & Pemanggilan](#4-pengamal-katalog--pemanggilan)
5. [Pengamal: Riwayat](#5-pengamal-riwayat)
6. [Admin: Dashboard](#6-admin-dashboard)
7. [Admin: Kelola User](#7-admin-kelola-user)
8. [Admin: Pemanggilan Aktif](#8-admin-pemanggilan-aktif)
9. [Admin: Buku Catatan Gaib](#9-admin-buku-catatan-gaib)
10. [Admin: Kelola Khodam](#10-admin-kelola-khodam)
11. [Admin: Kelola Kategori](#11-admin-kelola-kategori)
12. [Aturan Bisnis](#12-aturan-bisnis)
13. [Contoh Integrasi Frontend](#13-contoh-integrasi-frontend)
14. [Ringkasan Endpoint](#14-ringkasan-endpoint)

---

## 1. Informasi Umum

| Item             | Nilai                          |
| ---------------- | ------------------------------ |
| Base URL (lokal) | `http://localhost:8000/api/v1` |
| Format           | JSON                           |
| Autentikasi      | Laravel Sanctum, token Bearer  |
| Role             | `admin`, `pengamal`            |

### Header standar

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access_token>   # untuk endpoint terproteksi
```

> [!IMPORTANT]
> Selalu kirim `Accept: application/json` supaya error validasi/401 dikembalikan sebagai JSON, bukan redirect.

> [!NOTE]
> Untuk endpoint yang mengunggah file (`foto`) gunakan `multipart/form-data` (jangan set `Content-Type` manual, biarkan browser mengisi boundary). Update Khodam, Kategori, dan Profil memakai method **POST** (bukan PUT/PATCH).

### Format error

| Status | Arti                           | Contoh body                                                           |
| ------ | ------------------------------ | --------------------------------------------------------------------- |
| 401    | Token tidak ada/tidak valid    | `{"message": "Unauthenticated."}`                                     |
| 403    | Role tidak sesuai              | `{"message": "Akses ditolak. Endpoint ini hanya untuk peran admin."}` |
| 404    | Data tidak ditemukan           | `{"message": "No query results for model [...]"}`                     |
| 422    | Validasi gagal / aturan bisnis | lihat di bawah                                                        |
| 429    | Terlalu banyak percobaan login | via validasi 422 pada field `email`                                   |

Validasi 422 (standar Laravel):

```json
{
    "message": "The email field is required.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

Error aturan bisnis hanya berisi `{"message": "..."}`.

---

## 2. Autentikasi

> Semua endpoint auth berada di `/api/v1/...`.

### POST `/register`

Mendaftar akun baru. Role otomatis `pengamal`, profil default dibuat otomatis. Token langsung dikembalikan.

**Body**

| Field                 | Tipe   | Wajib | Aturan                                          |
| --------------------- | ------ | ----- | ----------------------------------------------- |
| name                  | string | ya    | maks 255                                        |
| email                 | string | ya    | email, huruf kecil, unik, maks 255              |
| password              | string | ya    | sesuai aturan password default Laravel (min. 8) |
| password_confirmation | string | ya    | harus sama dengan password                      |

**Response 201**

```json
{
    "message": "Registrasi berhasil",
    "access_token": "1|abcdef...",
    "token_type": "Bearer",
    "user": {
        "id": 5,
        "name": "Budi",
        "email": "budi@khodamku.test",
        "role": "pengamal",
        "profile": {
            "id": 5,
            "user_id": 5,
            "no_hp": "-",
            "alamat": "-",
            "tanggal_lahir": null,
            "weton": "-",
            "foto": null
        }
    }
}
```

### POST `/login`

**Body**

| Field    | Tipe   | Wajib |
| -------- | ------ | ----- |
| email    | string | ya    |
| password | string | ya    |

**Response 200**

```json
{
    "message": "Login berhasil",
    "access_token": "2|xyz...",
    "token_type": "Bearer",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@khodamku.test",
        "role": "admin"
    }
}
```

- Login menghapus semua token lama user (sesi di perangkat lain otomatis keluar).
- Gunakan `user.role` untuk mengarahkan ke halaman admin atau pengamal.
- Gagal: **422** `errors.email` ("These credentials do not match our records.").
- Batas **5 percobaan gagal** per email+IP, setelah itu 422 dengan pesan throttle.

### POST `/logout`

Header Bearer wajib. Response:

```json
{ "message": "Logout berhasil" }
```

> [!WARNING]
> Route logout memakai middleware `auth` (guard web), bukan `auth:sanctum`. Jika request dengan Bearer token mengembalikan 401, ganti ke `auth:sanctum` di `routes/auth.php`. Alternatif di frontend: hapus token lokal saja.

### POST `/forgot-password`

Body: `{ "email": "user@mail.com" }`
Response 200: `{ "status": "We have emailed your password reset link." }`
Gagal: 422 pada `errors.email`.

### POST `/reset-password`

| Field                 | Wajib | Keterangan        |
| --------------------- | ----- | ----------------- |
| token                 | ya    | dari tautan email |
| email                 | ya    |                   |
| password              | ya    |                   |
| password_confirmation | ya    |                   |

Response 200: `{ "status": "Your password has been reset." }`

### Verifikasi email (opsional)

- `POST /email/verification-notification` (login, throttle 6/menit): `{ "status": "verification-link-sent" }`
- `GET /verify-email/{id}/{hash}`: tautan bertanda tangan dari email, melakukan redirect ke `FRONTEND_URL/dashboard?verified=1`.

### GET `/user`

Mengembalikan objek user yang sedang login (tanpa profil). Berguna untuk cek token valid.

---

## 3. Profil

> Perlu login (semua role).

### GET `/profile`

```json
{
    "message": "Data profil berhasil diambil",
    "data": {
        "id": 5,
        "name": "Budi",
        "email": "budi@mail.com",
        "role": "pengamal",
        "profile": {
            "id": 5,
            "user_id": 5,
            "no_hp": "0812...",
            "alamat": "Jl. Mawar",
            "tanggal_lahir": "1999-01-20",
            "weton": "Senin Legi",
            "foto": "profiles/abc.jpg"
        }
    }
}
```

> `profile.foto` berupa **path relatif**. URL gambar: `{APP_URL}/storage/{foto}` (jalankan `php artisan storage:link`).

### POST `/profile`

`multipart/form-data` (agar bisa upload foto).

| Field         | Tipe   | Wajib  | Aturan                  |
| ------------- | ------ | ------ | ----------------------- |
| name          | string | tidak  | maks 255                |
| no_hp         | string | **ya** | maks 20                 |
| alamat        | string | **ya** |                         |
| tanggal_lahir | date   | tidak  | `YYYY-MM-DD`            |
| weton         | string | **ya** | maks 50                 |
| foto          | file   | tidak  | jpg/jpeg/png, maks 2 MB |

Response 200: `{ "message": "Profil berhasil diperbarui", "data": { ...user + profile } }`

---

## 4. Pengamal: Katalog & Pemanggilan

> Perlu login.

### GET `/khodam`

Katalog khodam beserta status ketersediaan.

**Query (semua opsional)**

| Param          | Keterangan                                 |
| -------------- | ------------------------------------------ |
| search         | cari di `nama` atau `kode_khodam`          |
| kategori_id    | filter berdasarkan kategori                |
| hanya_tersedia | `true`/`1` hanya yang "Menunggu Dipanggil" |

**Response 200**

```json
{
    "message": "Daftar khodam berhasil dimuat",
    "data": [
        {
            "id": 1,
            "kode_khodam": "KHD-001",
            "nama": "Macan Putih",
            "asal": "Jawa Barat",
            "level_kekuatan": 4,
            "deskripsi": "....",
            "foto": "http://localhost:8000/storage/khodams/abc.jpg",
            "status": "Menunggu Dipanggil",
            "is_tersedia": true,
            "kategoris": [{ "id": 1, "nama": "Penjaga" }]
        }
    ]
}
```

- `status`: `"Menunggu Dipanggil"` atau `"Sedang Bersemayam"`.
- `foto` sudah berupa URL penuh atau `null`.
- Tanpa pagination.

### POST `/pemanggilan`

Memanggil khodam.

**Body**

| Field       | Tipe    | Wajib | Keterangan                 |
| ----------- | ------- | ----- | -------------------------- |
| khodam_id   | integer | ya    | harus ada di tabel khodams |
| tgl_panggil | date    | tidak | default hari ini           |

Jatuh tempo otomatis = tanggal panggil + **5 hari**.

**Response 201**

```json
{
    "message": "Pemanggilan berhasil dilakukan",
    "data": {
        "id": 10,
        "user_id": 5,
        "khodam_id": 1,
        "tgl_panggil": "2026-10-25",
        "tgl_jatuh_tempo": "2026-10-30",
        "status": "aktif",
        "khodam": {
            "id": 1,
            "kode_khodam": "KHD-001",
            "nama": "Macan Putih",
            "asal": "Jawa Barat",
            "level_kekuatan": 4
        }
    }
}
```

**Error 422 (business rule)**

- `"Raga Anda hanya kuat menampung maksimal 2 khodam aktif secara bersamaan."`
- `"Khodam ini sedang bersemayam di raga pengamal lain."`

### GET `/pemanggilan/aktif`

Pemanggilan aktif milik user login, diurutkan jatuh tempo terdekat.

```json
{
    "message": "Daftar pemanggilan aktif Anda berhasil dimuat",
    "kuota_terpakai": 1,
    "kuota_maksimal": 2,
    "data": [
        {
            "id": 10,
            "kode_transaksi": "PMG-0010",
            "tgl_panggil": "2026-10-25",
            "tgl_jatuh_tempo": "2026-10-30",
            "status_badge": "5 hari lagi",
            "estimasi_mahar": 0,
            "is_terlambat": false,
            "khodam": {
                "id": 1,
                "kode_khodam": "KHD-001",
                "nama": "Macan Putih",
                "asal": "Jawa Barat",
                "level_kekuatan": 4
            }
        }
    ]
}
```

`status_badge`: `"N hari lagi"`, `"Hari ini"`, atau `"Telat N hari"`.

---

## 5. Pengamal: Riwayat

### GET `/riwayat`

Riwayat semua pemanggilan milik user login (terbaru dulu).

**Query (opsional)**

| Param          | Nilai                                              | Keterangan             |
| -------------- | -------------------------------------------------- | ---------------------- |
| dari_tanggal   | `YYYY-MM-DD`                                       | `tgl_panggil` >= nilai |
| sampai_tanggal | `YYYY-MM-DD`                                       | `tgl_panggil` <= nilai |
| status         | `semua` (default), `aktif`, `terlambat`, `dilepas` |                        |

**Response 200**

```json
{
    "message": "Riwayat pemanggilan berhasil dimuat",
    "ringkasan": {
        "total_transaksi": 3,
        "total_mahar": 15000,
        "total_mahar_formatted": "Rp15.000"
    },
    "filter_options": {
        "statuses": [
            { "value": "semua", "label": "Semua status" },
            { "value": "aktif", "label": "Aktif" },
            { "value": "terlambat", "label": "Terlambat" },
            { "value": "dilepas", "label": "Dilepas" }
        ]
    },
    "data": [
        {
            "id": 10,
            "kode_transaksi": "PMG-0010",
            "khodam": { "nama": "Macan Putih", "kode_khodam": "KHD-001" },
            "tgl_panggil": "2026-10-20",
            "tgl_panggil_formatted": "20 Okt 2026",
            "tgl_jatuh_tempo": "2026-10-25",
            "tgl_jatuh_tempo_formatted": "25 Okt 2026",
            "tgl_pelepasan": null,
            "tgl_pelepasan_formatted": "—",
            "mahar": 0,
            "mahar_formatted": "Rp0",
            "status": "Aktif"
        }
    ]
}
```

- `status` (label): `Aktif`, `Terlambat`, `Dilepas`.
- Mahar pada status Aktif/Terlambat adalah **estimasi** (format diawali `~Rp`). Mahar status Dilepas adalah nilai final.
- Tanpa pagination.

---

## 6. Admin: Dashboard

> Semua endpoint `/admin/*` memerlukan role `admin`. Selain itu 403.

### GET `/admin/dashboard`

Gabungan semua data dashboard.

```json
{
    "message": "Data dashboard",
    "data": {
        "tanggal": "2026-10-25",
        "ringkasan": { "terlambat": 2, "estimasi_mahar_terlambat": 35000 },
        "statistik": {
            "jumlah_unit": 20,
            "menunggu_dipanggil": 15,
            "sedang_bersemayam": 5,
            "pemanggilan_aktif": 5,
            "terlambat": 2
        },
        "jatuh_tempo_terdekat": [
            {
                "id": 3,
                "khodam": { "nama": "Macan Putih", "kode_khodam": "KHD-001" },
                "pengamal": "Budi",
                "tgl_jatuh_tempo": "2026-10-24",
                "status_badge": "Telat 1 hari",
                "is_terlambat": true
            }
        ],
        "kategori": [{ "id": 1, "nama": "Penjaga", "jumlah_khodam": 8 }],
        "pengamal_terdaftar": 12,
        "mahar_terkumpul": 120000
    }
}
```

Endpoint pecahan (struktur `data` sama dengan bagian terkait di atas):

| Endpoint                                    | Isi `data`                                                      |
| ------------------------------------------- | --------------------------------------------------------------- |
| GET `/admin/dashboard/statistik`            | objek `statistik`                                               |
| GET `/admin/dashboard/jatuh-tempo-terdekat` | array `jatuh_tempo_terdekat` (maks 4)                           |
| GET `/admin/dashboard/kategori`             | array `kategori`                                                |
| GET `/admin/dashboard/ringkasan`            | `tanggal`, `ringkasan`, `pengamal_terdaftar`, `mahar_terkumpul` |

---

## 7. Admin: Kelola User

### GET `/admin/users`

Daftar user dengan pagination (20 per halaman).

| Query  | Keterangan           |
| ------ | -------------------- |
| search | cari nama atau email |
| role   | `admin` / `pengamal` |
| page   | nomor halaman        |

```json
{
    "message": "Daftar user",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Admin",
                "email": "a@mail.com",
                "role": "admin",
                "profile": { "...": "..." }
            }
        ],
        "first_page_url": "...",
        "last_page": 1,
        "per_page": 20,
        "total": 1,
        "next_page_url": null,
        "prev_page_url": null
    }
}
```

> Perhatikan struktur bersarang: list ada di `response.data.data`.

### POST `/admin/users`

Body: `name`, `email`, `password`, `password_confirmation`, `role` (`admin` atau `pengamal`).
Response 201: `{ "message": "Akun admin baru berhasil dibuat", "data": { ...user, "profile": {...} } }`

`role` wajib diisi dan hanya boleh `admin` atau `pengamal`. Nilai lain ditolak dengan 422.

### GET `/admin/users/{id}`

`{ "message": "Detail user", "data": { ...user, "profile": {...} } }`

### POST `/admin/users/{id}`

Ubah data anggota. Mengikuti pola update khodam dan kategori (method `POST`, bukan `PUT`).

| Field    | Aturan                                                       |
| -------- | ------------------------------------------------------------ |
| name     | wajib, maks 255 karakter                                     |
| email    | wajib, huruf kecil, format email, unik kecuali milik user ini |
| password | opsional, min. 8 karakter. Kosong berarti sandi tidak diubah |
| no_hp    | opsional, maks 20 karakter                                   |
| alamat   | opsional, maks 1000 karakter                                 |

- `role` tidak bisa diubah lewat endpoint ini. Field `role` di body diabaikan.
- `no_hp` atau `alamat` yang tidak dikirim tetap bernilai lama. Yang dikirim kosong (`null`) disimpan sebagai `-`.
- Data user dan profil disimpan dalam satu transaksi.

Response 200: `{ "message": "Data user berhasil diperbarui", "data": { ...user, "profile": {...} } }`

Error: 404 jika user tidak ada, 422 jika validasi gagal, 403 jika bukan admin.

### DELETE `/admin/users/{id}`

`{ "message": "Akun user berhasil dihapus" }`

---

## 8. Admin: Pemanggilan Aktif

### GET `/admin/pemanggilan/aktif`

| Query | Nilai                                            |
| ----- | ------------------------------------------------ |
| tab   | `semua` (default), `terlambat`, `masih_berjalan` |

```json
{
    "message": "Daftar pemanggilan aktif berhasil dimuat",
    "tabs": { "semua": 5, "terlambat": 2, "masih_berjalan": 3 },
    "data": [
        {
            "id": 3,
            "kode_transaksi": "PMG-0003",
            "pengamal": "Budi",
            "khodam": { "nama": "Macan Putih", "kode_khodam": "KHD-001" },
            "tgl_panggil": "2026-10-19",
            "tgl_jatuh_tempo": "2026-10-24",
            "status_badge": "Telat 1 hari",
            "estimasi_mahar": 5000,
            "is_terlambat": true
        }
    ]
}
```

`tabs` dipakai sebagai badge jumlah pada tab antarmuka.

### POST `/admin/pemanggilan/{id}/lepas`

Melepas khodam (hanya untuk pemanggilan berstatus `aktif`, selain itu 404). Mahar final = hari terlambat x Rp5.000.

```json
{
    "message": "Khodam Macan Putih berhasil dilepaskan",
    "data": {
        "id": 3,
        "pengamal": "Budi",
        "khodam": "Macan Putih",
        "tgl_pelepasan": "2026-10-25",
        "hari_terlambat": 1,
        "mahar_akhir": 5000,
        "status": "dilepas"
    }
}
```

---

## 9. Admin: Buku Catatan Gaib

### GET `/admin/buku-catatan-gaib`

Riwayat semua pemanggilan (semua pengamal), terbaru dulu.

| Query                        | Keterangan                                         |
| ---------------------------- | -------------------------------------------------- |
| pengamal_id                  | ID user pengamal                                   |
| dari_tanggal, sampai_tanggal | `YYYY-MM-DD`, berdasarkan `tgl_panggil`            |
| status                       | `semua` (default), `aktif`, `terlambat`, `dilepas` |

Struktur sama dengan [`/riwayat`](#5-pengamal-riwayat), dengan tambahan:

- tiap item `data` memiliki `pengamal` (nama).
- `filter_options.pengamals`: `[{ "id": 5, "name": "Budi" }]` untuk dropdown filter.

---

## 10. Admin: Kelola Khodam

### GET `/admin/khodam`

Query dan response sama dengan [`GET /khodam`](#get-khodam).

### GET `/admin/khodam/{id}`

```json
{
    "message": "Detail khodam berhasil dimuat",
    "data": {
        "id": 1,
        "kode_khodam": "...",
        "nama": "...",
        "asal": "...",
        "level_kekuatan": 4,
        "deskripsi": "...",
        "foto": "http://.../storage/khodams/x.jpg",
        "status": "Menunggu Dipanggil",
        "is_tersedia": true,
        "kategoris": [{ "id": 1, "nama": "Penjaga" }]
    }
}
```

### POST `/admin/khodam`

`multipart/form-data`

| Field          | Tipe      | Wajib | Aturan                       |
| -------------- | --------- | ----- | ---------------------------- |
| kode_khodam    | string    | ya    | maks 50, unik                |
| nama           | string    | ya    | maks 255                     |
| asal           | string    | ya    | maks 255                     |
| level_kekuatan | integer   | ya    | 1 sampai 5                   |
| deskripsi      | string    | ya    |                              |
| foto           | file      | tidak | jpg/jpeg/png/webp, maks 2 MB |
| kategori_ids[] | array int | ya    | minimal 1, id harus ada      |

Contoh FormData: `kategori_ids[]=1&kategori_ids[]=2`.
Response 201: `{ "message": "Khodam berhasil ditambahkan", "data": { ...khodam, "kategoris": [...] } }`

> Catatan: `data.foto` pada response create/update berupa **path relatif** (`khodams/x.jpg`). Gunakan `GET` untuk URL penuh.

### POST `/admin/khodam/{id}`

Update. Field sama dengan create (semua wajib kecuali foto; `kode_khodam` unik dengan pengecualian dirinya). Foto lama otomatis dihapus bila foto baru diunggah.
Response 200: `{ "message": "Data khodam berhasil diperbarui", "data": {...} }`

### DELETE `/admin/khodam/{id}`

- 200: `{ "message": "Khodam berhasil dihapus" }`
- 422: `"Khodam tidak dapat dihapus karena sedang bersemayam pada raga pengamal."`

---

## 11. Admin: Kelola Kategori

| Method | Endpoint                         | Keterangan                |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/admin/kelola/kategori?search=` | daftar (tanpa pagination) |
| POST   | `/admin/kelola/kategori`         | tambah (201)              |
| GET    | `/admin/kelola/kategori/{id}`    | detail                    |
| POST   | `/admin/kelola/kategori/{id}`    | update                    |
| DELETE | `/admin/kelola/kategori/{id}`    | hapus                     |

**Body (create/update)**

| Field     | Wajib | Aturan           |
| --------- | ----- | ---------------- |
| nama      | ya    | string, maks 255 |
| deskripsi | ya    | string, maks 255 |

**Response item**

```json
{
    "id": 1,
    "nama": "Penjaga",
    "deskripsi": "...",
    "created_at": "...",
    "updated_at": "..."
}
```

Pesan sukses: `Kategori berhasil ditambahkan` / `Kategori berhasil diperbarui` / `Kategori berhasil dihapus`.

Hapus gagal (**400**) bila masih dipakai khodam: `"Kategori tidak dapat dihapus karena masih digunakan oleh khodam"`.

---

## 12. Aturan Bisnis

| Aturan                                  | Nilai                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Maksimal pemanggilan aktif per pengamal | 2                                                                                |
| Durasi pemanggilan                      | 5 hari                                                                           |
| Denda keterlambatan                     | Rp5.000 per hari                                                                 |
| Satu khodam                             | hanya boleh dipanggil 1 pengamal pada satu waktu                                 |
| Status pemanggilan di DB                | `aktif`, `dilepas`                                                               |
| Status "Terlambat"                      | `aktif` dan `tgl_jatuh_tempo` < hari ini (dihitung saat request, bukan disimpan) |
| Kode transaksi                          | `PMG-` + ID 4 digit (contoh `PMG-0010`)                                          |
| Level kekuatan                          | 1 sampai 5                                                                       |

---

## 13. Contoh Integrasi Frontend

```js
const BASE_URL = "http://localhost:8000/api/v1";

async function api(path, { method = "GET", body, isForm = false } = {}) {
    const token = localStorage.getItem("token");
    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body && !isForm) headers["Content-Type"] = "application/json";

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
    if (!res.ok) throw { status: res.status, ...data }; // data.errors untuk 422
    return data;
}

// Login
const { access_token, user } = await api("/login", {
    method: "POST",
    body: { email, password },
});
localStorage.setItem("token", access_token);
localStorage.setItem("role", user.role);

// Upload khodam (FormData)
const fd = new FormData();
fd.append("kode_khodam", "KHD-021");
fd.append("nama", "Naga Emas");
fd.append("asal", "Jawa Tengah");
fd.append("level_kekuatan", 5);
fd.append("deskripsi", "...");
fd.append("kategori_ids[]", 1);
fd.append("foto", fileInput.files[0]);
await api("/admin/khodam", { method: "POST", body: fd, isForm: true });
```

### Saran alur halaman

| Halaman                          | Role     | Endpoint                                                             |
| -------------------------------- | -------- | -------------------------------------------------------------------- |
| Register / Login / Lupa password | publik   | `/register`, `/login`, `/forgot-password`, `/reset-password`         |
| Katalog khodam                   | pengamal | `GET /khodam`, `POST /pemanggilan`                                   |
| Khodam saya (kuota)              | pengamal | `GET /pemanggilan/aktif`                                             |
| Riwayat                          | pengamal | `GET /riwayat`                                                       |
| Profil                           | semua    | `GET/POST /profile`                                                  |
| Dashboard                        | admin    | `GET /admin/dashboard`                                               |
| Pemanggilan aktif + pelepasan    | admin    | `GET /admin/pemanggilan/aktif`, `POST /admin/pemanggilan/{id}/lepas` |
| Buku catatan gaib                | admin    | `GET /admin/buku-catatan-gaib`                                       |
| Master khodam / kategori / user  | admin    | `/admin/khodam`, `/admin/kelola/kategori`, `/admin/users`            |

---

## 14. Ringkasan Endpoint

| Method | Endpoint                                | Auth | Role  | Keterangan                |
| ------ | --------------------------------------- | ---- | ----- | ------------------------- |
| POST   | `/register`                             | -    | -     | Daftar                    |
| POST   | `/login`                                | -    | -     | Login                     |
| POST   | `/logout`                               | ya   | semua | Logout                    |
| POST   | `/forgot-password`                      | -    | -     | Kirim tautan reset        |
| POST   | `/reset-password`                       | -    | -     | Reset password            |
| POST   | `/email/verification-notification`      | ya   | semua | Kirim ulang verifikasi    |
| GET    | `/verify-email/{id}/{hash}`             | ya   | semua | Verifikasi email          |
| GET    | `/user`                                 | ya   | semua | User saat ini             |
| GET    | `/profile`                              | ya   | semua | Lihat profil              |
| POST   | `/profile`                              | ya   | semua | Update profil             |
| GET    | `/khodam`                               | ya   | semua | Katalog khodam            |
| POST   | `/pemanggilan`                          | ya   | semua | Panggil khodam            |
| GET    | `/pemanggilan/aktif`                    | ya   | semua | Pemanggilan aktif saya    |
| GET    | `/riwayat`                              | ya   | semua | Riwayat saya              |
| GET    | `/admin/dashboard`                      | ya   | admin | Dashboard lengkap         |
| GET    | `/admin/dashboard/statistik`            | ya   | admin | Statistik                 |
| GET    | `/admin/dashboard/jatuh-tempo-terdekat` | ya   | admin | Jatuh tempo terdekat      |
| GET    | `/admin/dashboard/kategori`             | ya   | admin | Kategori + jumlah khodam  |
| GET    | `/admin/dashboard/ringkasan`            | ya   | admin | Ringkasan                 |
| GET    | `/admin/users`                          | ya   | admin | Daftar user               |
| POST   | `/admin/users`                          | ya   | admin | Tambah user               |
| GET    | `/admin/users/{id}`                     | ya   | admin | Detail user               |
| POST   | `/admin/users/{id}`                     | ya   | admin | Ubah data user            |
| DELETE | `/admin/users/{id}`                     | ya   | admin | Hapus user                |
| GET    | `/admin/pemanggilan/aktif`              | ya   | admin | Pemanggilan aktif         |
| POST   | `/admin/pemanggilan/{id}/lepas`         | ya   | admin | Lepas khodam              |
| GET    | `/admin/buku-catatan-gaib`              | ya   | admin | Riwayat seluruh transaksi |
| GET    | `/admin/khodam`                         | ya   | admin | Daftar khodam             |
| POST   | `/admin/khodam`                         | ya   | admin | Tambah khodam             |
| GET    | `/admin/khodam/{id}`                    | ya   | admin | Detail khodam             |
| POST   | `/admin/khodam/{id}`                    | ya   | admin | Update khodam             |
| DELETE | `/admin/khodam/{id}`                    | ya   | admin | Hapus khodam              |
| GET    | `/admin/kelola/kategori`                | ya   | admin | Daftar kategori           |
| POST   | `/admin/kelola/kategori`                | ya   | admin | Tambah kategori           |
| GET    | `/admin/kelola/kategori/{id}`           | ya   | admin | Detail kategori           |
| POST   | `/admin/kelola/kategori/{id}`           | ya   | admin | Update kategori           |
| DELETE | `/admin/kelola/kategori/{id}`           | ya   | admin | Hapus kategori            |
