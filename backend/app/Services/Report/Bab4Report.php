<?php

namespace App\Services\Report;

class Bab4Report
{
    public function generate($masterData)
    {
        $aktif = collect($masterData['guru'])
            ->where('status', 'Aktif')
            ->count();

        $cuti = collect($masterData['guru'])
            ->where('status', 'Cuti')
            ->count();

        $total = $aktif + $cuti;

        $rekap = [

            [
                'nama' => 'Guru Aktif',
                'jumlah' => $aktif,
            ],

            [
                'nama' => 'Guru Cuti',
                'jumlah' => $cuti,
            ],

        ];

        $persenAktif = $total
            ? round(($aktif / $total) * 100, 2)
            : 0;

        $persenCuti = $total
            ? round(($cuti / $total) * 100, 2)
            : 0;

        $intro = "

Sebagian besar tenaga pendidik TPQ Khairunissa berada pada status aktif. Berdasarkan data yang tersimpan dalam Sistem Informasi TPQ Khairunissa, jumlah guru aktif sebanyak <b>{$aktif}</b> orang, sedangkan guru yang sedang cuti sebanyak <b>{$cuti}</b> orang.

Data status guru disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Hasil analisis menunjukkan bahwa guru dengan status aktif mencapai <b>{$persenAktif}%</b> dari seluruh tenaga pendidik, sedangkan guru yang berstatus cuti sebesar <b>{$persenCuti}%</b>.

Komposisi tersebut menunjukkan bahwa sebagian besar tenaga pendidik masih aktif melaksanakan kegiatan pembelajaran.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Data status guru menunjukkan bahwa ketersediaan tenaga pendidik di TPQ Khairunissa masih berada pada kondisi yang baik sehingga proses pembelajaran dapat berjalan secara optimal.

";

        return [

            'intro' => $intro,

            'rekap' => $rekap,

            'total' => $total,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
