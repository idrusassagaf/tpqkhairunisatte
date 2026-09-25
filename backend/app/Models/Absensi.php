<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $table = 'absensis';

    protected $fillable = [
        'tipe',
        'person_id',
        'tanggal',
        'status',
        'jam',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];
}
