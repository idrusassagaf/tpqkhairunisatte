<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PDO;

class SqliteDataSeeder extends Seeder
{
    /**
     * Tabel yang di-skip karena bersifat transient / tidak relevan untuk di-seed.
     */
    protected array $excluded = [
        'migrations',
        'sessions',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'password_reset_tokens',
    ];

    /**
     * Kolom tanggal yang perlu dinormalisasi ke format Y-m-d.
     *
     * Data lama di database.sqlite kadang ditulis "2026-6-3" dan
     * "2026-06-03" untuk tanggal yang sama -- beda string di SQLite,
     * tapi begitu masuk kolom DATE asli MySQL, keduanya identik dan
     * bisa melanggar unique constraint.
     */
    protected array $dateColumns = ['tanggal', 'tanggal_lahir'];

    /**
     * Kolom unik per tabel, dipakai untuk dedupe setelah normalisasi tanggal.
     */
    protected array $uniqueColumns = [
        'jadwal_pengajians' => 'tanggal',
    ];

    /**
     * Seed data dari backend/database/database.sqlite ke koneksi database default.
     *
     * Jalankan:
     *   php artisan db:seed --class=SqliteDataSeeder
     */
    public function run(): void
    {
        $sqlitePath = database_path('database.sqlite');

        if (!file_exists($sqlitePath)) {
            $this->command->error("File tidak ditemukan: {$sqlitePath}");
            return;
        }

        $sqlite = new PDO("sqlite:{$sqlitePath}");
        $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $tables = $sqlite->query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )->fetchAll(PDO::FETCH_COLUMN);

        $tables = array_values(array_diff($tables, $this->excluded));

        Schema::disableForeignKeyConstraints();

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) {
                $this->command->warn("Lewati `{$table}`: tabel tidak ada di koneksi tujuan.");
                continue;
            }

            $rows = $sqlite->query("SELECT * FROM \"{$table}\"")->fetchAll(PDO::FETCH_ASSOC);

            if (empty($rows)) {
                continue;
            }

            foreach ($rows as &$row) {
                foreach ($this->dateColumns as $col) {
                    if (!empty($row[$col])) {
                        $row[$col] = date('Y-m-d', strtotime($row[$col]));
                    }
                }
            }
            unset($row);

            if (isset($this->uniqueColumns[$table])) {
                $col = $this->uniqueColumns[$table];
                $seen = [];
                $rows = array_values(array_filter($rows, function ($row) use ($col, &$seen) {
                    $key = $row[$col];
                    if (isset($seen[$key])) {
                        return false;
                    }
                    $seen[$key] = true;
                    return true;
                }));
            }

            DB::table($table)->delete();

            foreach (array_chunk($rows, 200) as $chunk) {
                DB::table($table)->insert($chunk);
            }

            $this->command->info("`{$table}`: " . count($rows) . " baris diseed.");
        }

        Schema::enableForeignKeyConstraints();

        $this->command->info('Selesai.');
    }
}
