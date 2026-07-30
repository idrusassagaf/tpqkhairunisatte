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
}
