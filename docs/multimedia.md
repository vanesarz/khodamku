# Multimedia

## 1. Kebutuhan Platform

### Pengembangan dan server

| Komponen | Kebutuhan |
| --- | --- |
| OS | Windows, macOS, atau Linux. CI memakai Ubuntu (`ubuntu-latest`) |
| PHP | `^8.3`, dengan ekstensi `pdo_sqlite`/`pdo_mysql`, `mbstring`, `xml`, `ctype`, `bcmath`, dan **`gd`** (dipakai test upload gambar) |
| Composer | 2.x |
| Node.js dan npm | Versi yang didukung Next.js 16 |
| Database | SQLite (lokal/CI), MySQL/MariaDB (produksi) |
| Perangkat keras minimum (pengembangan) | Estimasi: 2 core, 4 GB RAM, ruang disk bebas untuk `vendor/`, `node_modules/`, dan cache Composer/npm |

> [!NOTE]
> Di Windows, path proyek yang mengandung `&` membuat `npm run dev` gagal. Lihat `docs/log-debugging.md`.

### Pengguna

| Komponen | Kebutuhan |
| --- | --- |
| Browser | Browser modern yang didukung Next.js 16 / React 19 (Chrome, Edge, Firefox, Safari versi terbaru) |
| JavaScript | Wajib aktif |
| Cookie | Wajib aktif (token login disimpan di cookie `khodamku_token`) |
| Layar | Tata letak admin memakai sidebar tetap selebar `w-64` (`pl-64`), sehingga lebih nyaman di layar desktop/laptop |
| Cetak | Fitur cetak browser untuk Buku Catatan Gaib |

## 2. Pengolahan Gambar

### Upload dan validasi (backend)

Foto khodam ditangani `app/Http/Controllers/Admin/Kelola/KhodamController.php` pada `store` dan `update`:

```php
'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
```

| Aturan | Arti |
| --- | --- |
| `nullable` | Foto opsional |
| `image` | Harus file gambar |
| `mimes:jpg,jpeg,png,webp` | Hanya empat format ini |
| `max:2048` | Maksimal 2.048 KB (2 MB) |

### Penyimpanan

```php
$request->file('foto')->store('khodams', 'public');
```

| Item | Nilai |
| --- | --- |
| Disk | `public` |
| Folder fisik | `storage/app/public/khodams/` |
| Nama file | Nama acak dari Laravel (bukan nama asli dari pengguna) |
| Disimpan di database | Path relatif, mis. `khodams/abc123.jpg`, di kolom `khodams.foto` |
| URL publik | `asset('storage/' . $foto)`, butuh symlink `public/storage` (`php artisan storage:link`) |

Saat foto diganti atau khodam dihapus, controller memakai facade `Storage` untuk menghapus file lama.

### Keterbatasan

- Tidak ada resize, kompresi, atau pembuatan thumbnail. File disimpan apa adanya (maks 2 MB).
- Form khodam di frontend (`frontend/app/admin/kelola/khodam/page.tsx`) mengirim JSON, sehingga upload foto **belum bisa dilakukan dari UI**. Backend sudah siap menerima `multipart/form-data`.
- Katalog pengamal di frontend memakai gambar dari data mock (`frontend/src/lib/khodamData.ts`), bukan dari `storage`.
- Gambar statis halaman landing dimuat lewat `next/image` (`HeroSection.tsx`, `CalloutSection.tsx`).

## 3. Animasi CSS

### Animasi kustom di `frontend/app/globals.css`

Hanya ada satu keyframe kustom:

```css
@keyframes pulseGlow {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.6; }
}

.animate-pulse-glow {
  animation: pulseGlow 4s ease-in-out infinite;
}
```

Timeline `pulseGlow` (durasi 4 detik, berulang tanpa henti, easing `ease-in-out`):

| Waktu | Keyframe | Opacity |
| --- | --- | --- |
| 0,0 s | 0% | 0,3 |
| 2,0 s | 50% | 0,6 (paling terang) |
| 4,0 s | 100% | 0,3 (kembali, lalu mengulang) |

```
opacity
0.6 |        ___
    |      /     \
0.3 |____/         \____  (berulang)
    0s    2s     4s
```

> [!NOTE]
> Class `.animate-pulse-glow` didefinisikan, tetapi belum dipakai oleh komponen mana pun di `frontend/app` maupun `frontend/src`.

`html { scroll-behavior: smooth; }` juga didefinisikan di file yang sama untuk gulir halus.

### Animasi utilitas Tailwind yang dipakai

| Class | Efek | Contoh lokasi |
| --- | --- | --- |
| `animate-spin` | Ikon loading berputar (1 detik per putaran, linear, berulang) | Tombol simpan di halaman admin |
| `transition-colors`, `transition-all` | Perubahan warna halus saat hover | Tombol dan kartu |
| `active:scale-[0.99]`, `active:scale-95` | Tombol sedikit mengecil saat ditekan | Tombol utama |

### Catatan: animasi modal tidak aktif

Banyak modal memakai `animate-in fade-in zoom-in-95 duration-200` (mis. `frontend/app/admin/users/page.tsx`). Class tersebut berasal dari plugin animasi Tailwind (`tailwindcss-animate` / `tw-animate-css`), yang **tidak terpasang** di `frontend/package.json` dan tidak diimpor di `globals.css`. Akibatnya modal muncul tanpa animasi. Perbaikan: pasang plugin tersebut (perlu persetujuan karena menambah dependensi) atau definisikan keyframe sendiri di `globals.css`.
