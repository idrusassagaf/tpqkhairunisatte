<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lewati jika kolom sudah ada (mis. dibuat manual sebelumnya)
        if (Schema::hasColumn('users', 'foto')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('foto')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('users', 'foto')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('foto');
        });
    }
};
