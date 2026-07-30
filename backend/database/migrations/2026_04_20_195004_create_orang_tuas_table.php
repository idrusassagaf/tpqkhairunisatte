<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orang_tuas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_ayah');
            $table->string('pekerjaan_ayah')->nullable();
            $table->string('nama_ibu');
            $table->string('pekerjaan_ibu')->nullable();
            $table->string('no_hp')->nullable();
            $table->text('alamat')->nullable();
            $table->timestamps(); // ✅ HANYA SEKALI

            // OPSIONAL (kalau mau lebih lengkap nanti)
            // $table->string('pekerjaan')->nullable();
            // $table->string('hubungan')->nullable(); // Ayah / Ibu / Wali


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orang_tuas');
    }
};
