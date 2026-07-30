<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_pengajians', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->unique();
            $table->string('status'); // mengaji / libur
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_pengajians');
    }
};
