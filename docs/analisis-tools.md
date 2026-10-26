# Analisis Tools

Dokumen ini mendata tools yang benar-benar dipakai di repo KhodamKu. Versi diambil dari `composer.lock` (backend) dan `frontend/package-lock.json` (frontend) per 26 Oktober 2026.

## 1. Daftar Tools

### Backend (PHP)

| Tool | Versi terkunci | Constraint di `composer.json` | Fungsi |
| --- | --- | --- | --- |
| PHP | – | `^8.3` | Runtime backend |
| laravel/framework | v13.38.0 | `^13.17` | Framework REST API |
| laravel/sanctum | v4.3.3 | `^4.0` | Autentikasi token Bearer |
| laravel/tinker | v3.0.2 | `^3.0` | REPL untuk debugging |
| laravel/breeze | v2.4.2 | `^2.4` (dev) | Scaffolding controller autentikasi API |
| laravel/pint | v1.32.1 | `^1.27` (dev) | Formatter kode PHP |
| phpunit/phpunit | 12.5.40 | `^12.5.12` (dev) | Test runner |
| mockery/mockery | 1.6.15 | `^1.6` (dev) | Mock/stub di unit test |
| fakerphp/faker | v1.24.1 | `^1.23` (dev) | Data palsu untuk factory |
| laravel/pail | v1.2.7 | `^1.2.5` (dev) | Menampilkan log aplikasi di terminal |
| nunomaduro/collision | v8.9.5 | `^8.6` (dev) | Tampilan error di CLI |
| laravel/pao | v1.1.5 | `^1.0.6` (dev) | Format keluaran tool untuk agen (`--format agent`) |

### Frontend (Node.js)

| Tool | Versi terpasang | Constraint di `package.json` | Fungsi |
| --- | --- | --- | --- |
| next | 16.4.3 | `16.4.3` | Framework React (App Router, Route Handler) |
| react / react-dom | 19.3.0 | `19.3.0` | Library UI |
| tailwindcss | 4.3.3 | `^4` (dev) | Utility CSS |
| typescript | 5.9.3 | `^5` (dev) | Pemeriksaan tipe |
| eslint | 9.39.5 | `^9` (dev) | Linter (`eslint-config-next` 16.4.3) |
| lucide-react | 1.61.0 | `^1.61.0` | Ikon SVG |

### Infrastruktur dan Lingkungan

| Tool | Keterangan |
| --- | --- |
| GitHub Actions | `.github/workflows/laravel.yml`: PHP 8.3, SQLite, `php artisan test` di setiap push/PR ke `main` |
| SQLite | Database lokal (`.env`) dan CI |
| MySQL / MariaDB | Disebut di README sebagai database produksi; tidak ada konfigurasi khusus MySQL di repo |
| Laravel Boost (MCP) | Terdaftar di `boost.json` dan `.mcp.json` untuk membantu agen AI; bukan dependensi runtime |

## 2. Alasan Memilih

| Tool | Alasan |
| --- | --- |
| Laravel 13 | Routing, validasi, Eloquent ORM, migrasi, dan testing tersedia dalam satu framework. Tim tidak perlu merakit library terpisah. |
| Sanctum | Token API ringan untuk SPA. Tidak butuh OAuth server penuh seperti Passport. |
| Next.js 16 | Route Handler dipakai sebagai lapisan proxy (BFF) agar token disimpan di cookie httpOnly, bukan di JavaScript browser. |
| Tailwind CSS 4 | Styling langsung di komponen; tema gelap dan warna emas didefinisikan sekali di `globals.css`. |
| PHPUnit + Mockery | Bawaan Laravel; Mockery dipakai untuk menguji `PemanggilanService` tanpa database. |
| Pint | Gaya kode seragam tanpa konfigurasi tambahan (preset Laravel). |
| SQLite di CI | Tidak perlu service database terpisah di GitHub Actions, sehingga pipeline cepat dan sederhana. |

## 3. Perintah Uji Coba

Jalankan dari root repo kecuali disebutkan lain.

```bash
# Versi tools
php -v
composer -V
php artisan --version
node -v && npm -v

# Backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan test --compact
vendor/bin/pint --dirty

# Frontend (dari folder frontend/)
npm install
npx tsc --noEmit
npm run lint
npm run dev
```

Hasil terakhir yang dijalankan di sesi ini (Windows, PHP 8.5.12 dari Laragon):

| Perintah | Hasil |
| --- | --- |
| `php artisan test --compact` | 115 test, 114 lulus, 1 gagal: `KelolaKhodamTest::test_admin_bisa_menambah_khodam_baru` dengan pesan `GD extension is not installed.` (ekstensi GD tidak aktif di PHP lokal) |
| `vendor/bin/pint --dirty --format agent` | Lulus setelah perapian otomatis |
| `npx tsc --noEmit` (frontend) | Lulus, exit 0 |
| `npm run lint` | [ISI SETELAH DIJALANKAN] |
| Durasi `php artisan test` di CI | [ISI SETELAH DIJALANKAN] |

## 4. Risiko Pemakaian dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Versi PHP lokal berbeda dengan CI (lokal 8.5.12, CI 8.3) | Perilaku bisa berbeda antar lingkungan | Samakan versi PHP lokal dengan CI, atau tambahkan matriks versi di workflow |
| Ekstensi GD tidak aktif di PHP lokal | Test upload foto gagal di lokal | Aktifkan `extension=gd` di `php.ini`; CI sudah memakai `setup-php` |
| Path folder mengandung `&` (`PELATIHAN & SERTIFIKASI`) | `npm run dev` gagal karena `cmd.exe` memotong path | Ganti nama folder tanpa `&`, atau jalankan `node node_modules/next/dist/bin/next dev` |
| CI memakai SQLite, produksi MySQL | Query spesifik MySQL (mis. `lockForUpdate`) tidak teruji di CI | Tambahkan job CI dengan service MySQL |
| Next.js 16 menandai `middleware.ts` sebagai deprecated | Peringatan saat `next dev`; bisa dihapus di versi mendatang | Migrasi ke konvensi `proxy` sesuai pesan Next.js |
| Fitur eksperimental Next (`experimental.agentFeedback`, `partialPrefetching`) | Bisa berubah tanpa jaminan kompatibilitas | Kunci versi `next` (sudah tanpa `^`) dan uji sebelum upgrade |
| Constraint `^` di Composer/npm | Upgrade minor bisa membawa perubahan perilaku | Commit `composer.lock` dan `package-lock.json` (sudah dilakukan); upgrade lewat PR terpisah |
| Laravel Boost MCP gagal terhubung | Agen AI kehilangan alat bantu dokumentasi | Tidak memengaruhi aplikasi; jalankan ulang server MCP |
