<?php

namespace App\Services\Report;

class Bab8Report
{
    public function generate($masterData)
    {
        $santri = collect($masterData['santri'])->count();
        $guru = collect($masterData['guru'])->count();

        $rasioGuru = $guru
            ? round($santri / $guru, 1)
            : 0;

        $rekap = [

            [
                'nama' => 'Jumlah Santri',
                'jumlah' => $santri,
            ],

            [
                'nama' => 'Jumlah Guru',
                'jumlah' => $guru,
            ],

            [
                'nama' => 'Rasio Santri / Guru',
                'jumlah' => $guru ? "1 : {$rasioGuru}" : "-",
            ],

        ];

        $intro = "

Bab ini merupakan rangkuman akhir dari seluruh data yang telah disajikan pada laporan.

Berdasarkan data yang tersimpan dalam Sistem Informasi Manajemen TPQ Khairunissa, laporan ini menggambarkan kondisi santri, guru, serta perkembangan proses pembelajaran secara menyeluruh.

Ringkasan data utama disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data yang tersedia, TPQ Khairunissa saat ini mengelola <b>{$santri}</b> santri dengan dukungan <b>{$guru}</b> guru aktif.

Rasio guru terhadap jumlah santri menunjukkan bahwa setiap guru membimbing rata-rata sekitar <b>{$rasioGuru}</b> santri sehingga proses pembelajaran dapat berlangsung secara efektif sesuai kapasitas tenaga pengajar yang tersedia.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Seluruh informasi yang disajikan dalam laporan ini dihasilkan secara otomatis berdasarkan data yang tersimpan pada Sistem Informasi Manajemen TPQ Khairunissa.

Laporan ini diharapkan menjadi dasar dalam proses evaluasi, pengambilan keputusan, serta penyusunan program pengembangan TPQ pada periode berikutnya.

";

        return [

            'intro' => $intro,

            'rekap' => $rekap,

            'totalSantri' => $santri,

            'totalGuru' => $guru,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
