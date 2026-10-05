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
        // Gagal lebih awal dengan pesan jelas, daripada error SQL mentah
        // ketika ada data duplikat yang belum dibereskan.
        $duplikat = DB::table('progres_hafalans')
            ->select('nis', 'jenis_hafalan', DB::raw('COUNT(*) as jumlah'))
            ->groupBy('nis', 'jenis_hafalan')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        if ($duplikat->isNotEmpty()) {
            $daftar = $duplikat
                ->map(fn ($row) => "{$row->nis} / {$row->jenis_hafalan} ({$row->jumlah}x)")
                ->implode(', ');

            throw new RuntimeException(
                'Migrasi dibatalkan: masih ada data hafalan duplikat. Selesaikan dulu: '.$daftar
            );
        }

        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->unique(['nis', 'jenis_hafalan'], 'progres_hafalans_nis_jenis_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->dropUnique('progres_hafalans_nis_jenis_unique');
        });
    }
};
