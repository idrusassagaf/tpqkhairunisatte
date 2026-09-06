<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanSistem extends Model
{
    protected $table = 'pengaturan_sistem';

    protected $fillable = [

        // =====================================================
        // IDENTITAS TPQ
        // =====================================================

        'nama_tpq',
        'alamat',
        'kelurahan',
        'kecamatan',
        'kota',
        'provinsi',
        'no_hp',
        'email',
        'logo',


        // =====================================================
        // PROFIL TPQ
        // =====================================================

        'profil',
        'visi',
        'misi',
        'nilai_akhlak',
        'nilai_quran',
        'nilai_disiplin',
        'nilai_prestasi',


        // =====================================================
        // HOME - PROGRAM
        // =====================================================

        'program_iqra',
        'program_quran',
        'program_tahfidz',


        // =====================================================
        // HOME - KEUNGGULAN
        // =====================================================

        'keunggulan_iqra_quran',
        'keunggulan_ibadah',
        'keunggulan_akhlak',
        'keunggulan_guru',


        // =====================================================
        // HOME - PERSYARATAN
        // =====================================================

        'syarat_gratis',
        'syarat_form',
        'syarat_kk',
        'syarat_ktp',
    ];
}
