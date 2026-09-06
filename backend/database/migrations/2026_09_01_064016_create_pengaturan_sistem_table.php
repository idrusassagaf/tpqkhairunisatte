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
        Schema::create('pengaturan_sistem', function (Blueprint $table) {
            $table->id();

            $table->string('nama_tpq')
                ->default('TPQ Khairunissa');

            $table->string('nama_pimpinan')
                ->nullable();

            $table->text('alamat')
                ->nullable();

            $table->string('kelurahan')
                ->nullable();

            $table->string('kecamatan')
                ->nullable();

            $table->string('kota')
                ->default('Ternate');

            $table->string('provinsi')
                ->default('Maluku Utara');

            $table->string('no_hp')
                ->nullable();

            $table->string('email')
                ->nullable();

            $table->string('logo')
                ->nullable();

            $table->text('deskripsi')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_sistem');
    }
};
