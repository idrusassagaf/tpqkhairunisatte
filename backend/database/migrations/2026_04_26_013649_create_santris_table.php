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
        Schema::create('santris', function (Blueprint $table) {
            $table->id();

            // 🔹 DATA UTAMA SANTRI
            $table->string('nama');
            $table->string('nis')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->date('tanggal_lahir');
            $table->integer('usia')->nullable();

            $table->text('alamat')->nullable();
            $table->string('kontak')->nullable();

            // 🔹 STATUS
            $table->string('status_orangtua')->nullable();
            $table->string('status_anak')->nullable();

            // 🔹 RELASI ORANG TUA
            $table->foreignId('orang_tua_id')
                ->constrained('orang_tuas')
                ->cascadeOnDelete();

            // 🔹 RELASI GURU (opsional dulu)
            $table->foreignId('guru_id')
                ->nullable()
                ->constrained('gurus')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('santris');
    }
};
