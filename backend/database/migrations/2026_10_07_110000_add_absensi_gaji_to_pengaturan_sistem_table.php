<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengaturan_sistem', function (Blueprint $table) {
            if (!Schema::hasColumn('pengaturan_sistem', 'absensi_mulai')) {
                $table->string('absensi_mulai', 5)->default('17:30')->after('syarat_ktp');
            }

            if (!Schema::hasColumn('pengaturan_sistem', 'absensi_selesai')) {
                $table->string('absensi_selesai', 5)->default('20:00')->after('absensi_mulai');
            }

            if (!Schema::hasColumn('pengaturan_sistem', 'gaji_per_hari')) {
                $table->unsignedInteger('gaji_per_hari')->default(50000)->after('absensi_selesai');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pengaturan_sistem', function (Blueprint $table) {
            foreach (['gaji_per_hari', 'absensi_selesai', 'absensi_mulai'] as $kolom) {
                if (Schema::hasColumn('pengaturan_sistem', $kolom)) {
                    $table->dropColumn($kolom);
                }
            }
        });
    }
};
