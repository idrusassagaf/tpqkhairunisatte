<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('master_hafalans', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->unsignedSmallInteger('urutan')->default(0);
            $table->timestamps();
        });

        $daftar = array (
  0 => 'Doa Sebelum Belajar Mengaji',
  1 => 'Doa Sesudah Belajar Mengaji',
  2 => 'Doa Berwudhu',
  3 => 'Doa Sesudah Berwudhu',
  4 => 'Doa Sesudah Azan',
  5 => 'Doa Menjawab Iqamah',
  6 => 'Niat Shalat Dhuhur',
  7 => 'Niat Shalat Ashar',
  8 => 'Niat Shalat Maghrib',
  9 => 'Niat Shalat Isya',
  10 => 'Niat Shalat Subuh',
  11 => 'Doa Doa Iftitah',
  12 => 'Doa Ketika Ruku',
  13 => 'Doa Ketika I\'tidal',
  14 => 'Doa Ketika Sujud',
  15 => 'Doa Duduk Diantara Dua Sujud',
  16 => 'Doa Tahyatul Awal',
  17 => 'Doa Tahyatul Akhir',
  18 => 'Doa Qunut',
  19 => 'Doa Sebelum Tidur',
  20 => 'Doa Bangun Tidur',
  21 => 'Doa Masuk Kamar Mandi',
  22 => 'Doa Keluar Kamar Mandi',
  23 => 'Doa Bersuci dari Hadast Kecil',
  24 => 'Doa Mandi Janabah',
  25 => 'Doa Mandi Hari Jumat',
  26 => 'Doa Ketika Bercermin',
  27 => 'Doa Ketika Masuk Rumah',
  28 => 'Doa Keluar Rumah',
  29 => 'Doa Masuk Masjid',
  30 => 'Doa Keluar Masjid',
  31 => 'Doa Naik Kendaraan Bepergian',
  32 => 'Doa Sebelum Makan',
  33 => 'Doa Sesudah Makan',
  34 => 'Doa untuk Orangtua',
  35 => 'Doa Selamat Dunia dan Akhirat',
  36 => 'Doa Memohon Ampunan',
  37 => 'Doa Syifa (Kesembuhan)',
  38 => 'Niat Berpuasa Ramadhan',
  39 => 'Niat Membayar Hutang Puasa Ramadhan',
  40 => 'Doa Berbuka Puasa',
  41 => 'Ayat Kursi',
  42 => 'Niat Shalat Witir',
  43 => 'Niat Shalat Tarawih',
  44 => 'Dzikir Tauhid',
  45 => 'Bacaan Salam kepada Rasulullah SAW dan Keluarga',
);
        $now = now();
        DB::table('master_hafalans')->insert(array_map(
            fn ($nama, $i) => ['nama' => $nama, 'urutan' => $i + 1, 'created_at' => $now, 'updated_at' => $now],
            $daftar,
            array_keys($daftar)
        ));
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_hafalans');
    }
};
