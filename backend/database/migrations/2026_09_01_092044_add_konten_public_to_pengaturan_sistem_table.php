<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan konten Profil dan Home
     * ke tabel pengaturan_sistem.
     */
    public function up(): void
    {
        Schema::table('pengaturan_sistem', function (Blueprint $table) {

            // =====================================================
            // PROFIL TPQ
            // =====================================================

            $table->text('profil')
                ->nullable();

            $table->text('visi')
                ->nullable();

            $table->text('misi')
                ->nullable();

            $table->text('nilai_akhlak')
                ->nullable();

            $table->text('nilai_quran')
                ->nullable();

            $table->text('nilai_disiplin')
                ->nullable();

            $table->text('nilai_prestasi')
                ->nullable();


            // =====================================================
            // HOME - PROGRAM
            // =====================================================

            $table->text('program_iqra')
                ->nullable();

            $table->text('program_quran')
                ->nullable();

            $table->text('program_tahfidz')
                ->nullable();


            // =====================================================
            // HOME - MENGAPA MEMILIH TPQ
            // =====================================================

            $table->text('keunggulan_iqra_quran')
                ->nullable();

            $table->text('keunggulan_ibadah')
                ->nullable();

            $table->text('keunggulan_akhlak')
                ->nullable();

            $table->text('keunggulan_guru')
                ->nullable();


            // =====================================================
            // HOME - PERSYARATAN PENDAFTARAN
            // =====================================================

            $table->text('syarat_gratis')
                ->nullable();

            $table->text('syarat_form')
                ->nullable();

            $table->text('syarat_kk')
                ->nullable();

            $table->text('syarat_ktp')
                ->nullable();
        });
    }

    /**
     * Hapus kolom jika migration di-rollback.
     */
    public function down(): void
    {
        Schema::table('pengaturan_sistem', function (Blueprint $table) {

            $table->dropColumn([
                'profil',
                'visi',
                'misi',
                'nilai_akhlak',
                'nilai_quran',
                'nilai_disiplin',
                'nilai_prestasi',

                'program_iqra',
                'program_quran',
                'program_tahfidz',

                'keunggulan_iqra_quran',
                'keunggulan_ibadah',
                'keunggulan_akhlak',
                'keunggulan_guru',

                'syarat_gratis',
                'syarat_form',
                'syarat_kk',
                'syarat_ktp',
            ]);
        });
    }
};
