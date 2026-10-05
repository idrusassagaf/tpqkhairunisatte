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
        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->foreignId('master_hafalan_id')->nullable()->after('nig')
                ->constrained('master_hafalans')->restrictOnDelete();
        });

        // Isi referensi dari nama yang cocok (perbandingan tidak peka huruf besar-kecil).
        DB::statement('
            UPDATE progres_hafalans p
            JOIN master_hafalans m ON LOWER(TRIM(p.jenis_hafalan)) = LOWER(TRIM(m.nama))
            SET p.master_hafalan_id = m.id
        ');

        $tanpaMaster = DB::table('progres_hafalans')
            ->whereNull('master_hafalan_id')
            ->distinct()
            ->pluck('jenis_hafalan');

        if ($tanpaMaster->isNotEmpty()) {
            throw new RuntimeException(
                'Migrasi dibatalkan: jenis hafalan belum ada di master: '.$tanpaMaster->implode(', ')
            );
        }

        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->dropUnique('progres_hafalans_nis_jenis_unique');
            $table->foreignId('master_hafalan_id')->nullable(false)->change();
            $table->unique(['nis', 'master_hafalan_id'], 'progres_hafalans_nis_master_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->dropUnique('progres_hafalans_nis_master_unique');
            $table->unique(['nis', 'jenis_hafalan'], 'progres_hafalans_nis_jenis_unique');
            $table->dropForeign(['master_hafalan_id']);
            $table->dropColumn('master_hafalan_id');
        });
    }
};
