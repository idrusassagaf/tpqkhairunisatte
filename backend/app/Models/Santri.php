<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Santri extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'nis',
        'jenis_kelamin',
        'tanggal_lahir',
        'usia',
        'alamat',
        'kontak',
        'status_orangtua',
        'status_anak',
        'kelas',
        'foto', // 🔥 WAJIB ADA
        'orang_tua_id'
    ];
    public function orangTua()
    {
        return $this->belongsTo(\App\Models\OrangTua::class);
    }

    /**
     * NIS berikutnya: nomor tertinggi + 1 (contoh: S-1001, S-1002, ...).
     *
     * Harus dipanggil di dalam transaksi. lockForUpdate mencegah dua santri
     * baru mendapat NIS yang sama saat disimpan bersamaan.
     */
    public static function nisBerikutnya(): string
    {
        $tertinggi = static::query()
            ->where('nis', 'like', 'S-%')
            ->lockForUpdate()
            ->pluck('nis')
            ->map(fn ($nis) => (int) preg_replace('/\D/', '', $nis))
            ->max() ?? 1000;

        return 'S-' . str_pad((string) ($tertinggi + 1), 4, '0', STR_PAD_LEFT);
    }
}
