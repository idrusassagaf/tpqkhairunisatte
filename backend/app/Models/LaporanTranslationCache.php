<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanTranslationCache extends Model
{
    protected $table = 'laporan_translation_cache';

    protected $fillable = [
        'language',
        'content_hash',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
