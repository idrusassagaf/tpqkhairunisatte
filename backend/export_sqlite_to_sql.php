<?php

/**
 * Export data dari database.sqlite menjadi file .sql yang kompatibel
 * dengan MySQL/MariaDB (untuk diimport lewat phpMyAdmin).
 *
 * Catatan:
 * - Hanya men-generate INSERT, TIDAK membuat CREATE TABLE.
 * - Jalankan `php artisan migrate` dulu di database MySQL tujuan
 *   supaya struktur tabel sudah ada, sebelum import file ini.
 */

$dbPath = __DIR__ . '/database/database.sqlite';
$outPath = __DIR__ . '/database/database_backup.sql';

$pdo = new PDO("sqlite:$dbPath");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$out = fopen($outPath, 'w');
fwrite($out, "SET FOREIGN_KEY_CHECKS=0;\n\n");

$excluded = [
    'migrations',
    'sessions',
    'cache',
    'cache_locks',
    'jobs',
    'job_batches',
    'failed_jobs',
    'password_reset_tokens',
];

$tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    ->fetchAll(PDO::FETCH_COLUMN);

$tables = array_values(array_diff($tables, $excluded));

// Kolom tanggal yang perlu dinormalisasi ke format Y-m-d.
// Data lama di SQLite kadang ditulis "2026-6-3" dan "2026-06-03"
// untuk tanggal yang sama -- keduanya beda string di SQLite,
// tapi begitu masuk kolom DATE asli MySQL, keduanya jadi identik
// dan melanggar unique constraint.
$dateColumns = ['tanggal', 'tanggal_lahir'];

// Kolom unik per tabel, dipakai untuk dedupe setelah normalisasi tanggal
// supaya tidak ada dua baris yang jadi bentrok setelah dinormalisasi.
$uniqueColumns = [
    'jadwal_pengajians' => 'tanggal',
];

foreach ($tables as $name) {
    $rows = $pdo->query("SELECT * FROM \"$name\"")->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rows)) {
        continue;
    }

    foreach ($rows as &$row) {
        foreach ($dateColumns as $col) {
            if (isset($row[$col]) && $row[$col] !== null && $row[$col] !== '') {
                $row[$col] = date('Y-m-d', strtotime($row[$col]));
            }
        }
    }
    unset($row);

    if (isset($uniqueColumns[$name])) {
        $col = $uniqueColumns[$name];
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

    fwrite($out, "-- Data untuk tabel `$name`\n");
    fwrite($out, "DELETE FROM `$name`;\n");

    $columns = array_keys($rows[0]);
    $columnList = '`' . implode('`, `', $columns) . '`';

    foreach ($rows as $row) {
        $values = array_map(function ($value) use ($pdo) {
            if ($value === null) {
                return 'NULL';
            }
            return $pdo->quote($value);
        }, array_values($row));

        fwrite($out, "INSERT INTO `$name` ($columnList) VALUES (" . implode(', ', $values) . ");\n");
    }

    fwrite($out, "\n");
}

fwrite($out, "SET FOREIGN_KEY_CHECKS=1;\n");
fclose($out);

echo "Selesai. File disimpan di: $outPath\n";
