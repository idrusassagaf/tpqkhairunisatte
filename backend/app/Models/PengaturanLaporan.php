<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanLaporan extends Model
{
    protected $table = 'pengaturan_laporan';

    protected $fillable = [
        'judul',
        'sub_judul',
        'narasi',
        'status',
    ];

    protected $casts = [
        'narasi' => 'array',
    ];

    protected $hidden = [
        'penutup',
    ];
}
