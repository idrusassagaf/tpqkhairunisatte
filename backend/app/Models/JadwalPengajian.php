<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalPengajian extends Model
{
    protected $fillable = [
        'tanggal',
        'status',
    ];
}
