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
            $table->foreignId('guru_id')->nullable()->after('nig')
                ->constrained('gurus')->restrictOnDelete();
        });

        // Isi referensi dari NIG guru yang tersimpan di setiap baris progres.
        DB::statement('
            UPDATE progres_hafalans p
            JOIN gurus g ON g.nig = p.nig
            SET p.guru_id = g.id
        ');

        $tanpaGuru = DB::table('progres_hafalans')
            ->whereNull('guru_id')
            ->distinct()
            ->pluck('nig');

        if ($tanpaGuru->isNotEmpty()) {
            throw new RuntimeException(
                'Migrasi dibatalkan: NIG guru tidak ditemukan di tabel guru: '.$tanpaGuru->implode(', ')
            );
        }

        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->foreignId('guru_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progres_hafalans', function (Blueprint $table) {
            $table->dropForeign(['guru_id']);
            $table->dropColumn('guru_id');
        });
    }
};
