<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    protected $fillable = [
        'nama_guru',
        'nig',
        'jenis_kelamin',
        'tanggal_lahir',
        'usia',
        'pendidikan',
        'pekerjaan',
        'kontak',
    ];
}
