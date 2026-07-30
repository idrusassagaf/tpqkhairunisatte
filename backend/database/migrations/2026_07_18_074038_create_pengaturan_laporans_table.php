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
        Schema::create('pengaturan_laporan', function (Blueprint $table) {

            $table->id();

            $table->string('judul')
                ->default('Laporan Ringkas TPQ Khairunissa');

            $table->string('sub_judul')
                ->default('Sistem Informasi Manajemen TPQ Khairunissa');

            $table->longText('narasi')->nullable();

            $table->longText('penutup')->nullable();

            $table->enum('status', [
                'Draft',
                'Aktif'
            ])->default('Aktif');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_laporan');
    }
};
