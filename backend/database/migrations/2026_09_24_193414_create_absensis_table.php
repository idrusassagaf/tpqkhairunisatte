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
        Schema::create('absensis', function (Blueprint $table) {
            $table->id();

            // santri / guru
            $table->string('tipe', 10);

            // ID dari tabel santris atau gurus
            $table->unsignedBigInteger('person_id');

            // Tanggal kehadiran
            $table->date('tanggal');

            // H = Hadir, I = Izin, S = Sakit, A = Alpa
            $table->string('status', 1);

            // Jam saat melakukan absensi
            $table->time('jam')->nullable();

            $table->timestamps();

            // Satu orang hanya boleh memiliki satu absensi
            // untuk satu tanggal.
            $table->unique(
                ['tipe', 'person_id', 'tanggal'],
                'absensis_tipe_person_tanggal_unique'
            );

            $table->index(['tipe', 'tanggal']);
            $table->index(['person_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensis');
    }
};
