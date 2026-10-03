<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cache terjemahan Laporan Ringkas per bahasa.
     *
     * Isi bab1-8 bersifat auto-generate dari data live (jumlah
     * santri, progres, dll), jadi tidak bisa "translate sekali saat
     * simpan" seperti Profil/Berita/Pengumuman/Galeri -- datanya bisa
     * berubah kapan saja lewat banyak tempat (CRUD santri, progres,
     * dll).
     *
     * Solusinya: simpan hash dari konten saat ini. Request berikutnya
     * hanya panggil Gemini lagi kalau hash berubah (artinya data
     * laporan benar-benar berubah sejak terakhir diterjemahkan).
     * Kalau hash sama, pakai cache -- tanpa panggilan AI sama sekali.
     */
    public function up(): void
    {
        Schema::create('laporan_translation_cache', function (Blueprint $table) {
            $table->id();
            $table->string('language')->unique();
            $table->string('content_hash');
            $table->json('data');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_translation_cache');
    }
};
