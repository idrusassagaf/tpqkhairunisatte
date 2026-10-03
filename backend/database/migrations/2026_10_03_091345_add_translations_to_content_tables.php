<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengaturan_sistem', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('syarat_ktp');
        });

        Schema::table('berita', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('status');
        });

        Schema::table('pengumuman', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('status');
        });

        Schema::table('galeris', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('foto');
        });
    }

    public function down(): void
    {
        Schema::table('pengaturan_sistem', function (Blueprint $table) {
            $table->dropColumn('translations');
        });

        Schema::table('berita', function (Blueprint $table) {
            $table->dropColumn('translations');
        });

        Schema::table('pengumuman', function (Blueprint $table) {
            $table->dropColumn('translations');
        });

        Schema::table('galeris', function (Blueprint $table) {
            $table->dropColumn('translations');
        });
    }
};
