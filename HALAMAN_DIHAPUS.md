# Halaman yang Dihapus

Catatan perubahan struktur halaman dashboard. Perubahan ini belum di-commit.

## File yang dihapus

| File | Isi sebelumnya | Pengganti |
|---|---|---|
| `frontend/src/pages/dashboard/MasterData.jsx` | Form dan daftar data santri serta guru | **Database Santri** (`datasantri.jsx`) dan **Database Guru** (`databaseguru.jsx`), keduanya dengan tambah, ubah, dan hapus |
| `frontend/src/pages/dashboard/MasterHafalan.jsx` | Rekap hafalan lancar dan belum lancar per santri | **Progres Hafalan** (`ProgresHafalan.jsx`) |

## Rute dan menu yang dihapus

| Rute | Menu sidebar | Keterangan |
|---|---|---|
| `/dashboard/master-data` | Master Data | Dialihkan ke Database Santri dan Database Guru |
| `/dashboard/master-hafalan` | Master Hafalan | Digabung ke Progres Hafalan |
| `/dashboard/master-hafalan/:nis` | - | Detail santri sekarang di `/dashboard/progres-hafalan/:nis` |

Entri judul `master-hafalan` di `Navbar.jsx` juga dihapus.

## Perubahan lain yang terkait

- Kartu "Master Data" di Dashboard sekarang mengarah ke `/dashboard/data-santri`.
- Kartu "Master Hafalan" di Dashboard sekarang mengarah ke `/dashboard/progres-hafalan`.
- Hak simpan progres hafalan hanya untuk role Admin, sesuai izin `POST /progres-hafalan` di backend.

## Cara mengembalikan

Semua file di atas masih ada di riwayat git. Contoh:

```bash
git checkout HEAD -- frontend/src/pages/dashboard/MasterData.jsx
```
