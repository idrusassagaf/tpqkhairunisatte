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
        Schema::create('progres_qurans', function (Blueprint $table) {
            $table->id();

            $table->string('nama_santri');
            $table->string('nis');

            $table->string('nama_guru');
            $table->string('nig');

            $table->string('kelas')->nullable();

            $table->string('juz')->nullable();
            $table->string('surah')->nullable();
            $table->string('ayat')->nullable();
            $table->string('halaman')->nullable();

            $table->string('progres')->nullable();
            $table->string('prestasi')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progres_qurans');
    }
};
