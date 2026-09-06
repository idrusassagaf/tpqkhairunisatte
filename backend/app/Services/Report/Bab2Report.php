<?php

namespace App\Services\Report;

class Bab2Report
{
    public function generate($masterData)
    {
        /*
        |--------------------------------------------------------------------------
        | DATA SANTRI
        |--------------------------------------------------------------------------
        */

        $santri = collect($masterData['santri']);

        /*
        |--------------------------------------------------------------------------
        | HITUNG DATA SESUAI TABEL BAB II
        |--------------------------------------------------------------------------
        */

        // Santunan OT
        $santunanOT = $santri
            ->where('status_orangtua', 'keduanya_hidup')
            ->count();

        // Anak Yatim
        $anakYatim = $santri
            ->where('status_orangtua', 'ayah_wafat')
            ->count();

        // Anak Piatu
        $anakPiatu = $santri
            ->where('status_orangtua', 'ibu_wafat')
            ->count();

        // Yatim Piatu
        $yatimPiatu = $santri
            ->where('status_orangtua', 'keduanya_wafat')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | TOTAL SANTRI
        |--------------------------------------------------------------------------
        */

        $total = $santri->count();

        /*
        |--------------------------------------------------------------------------
        | PERSENTASE
        |--------------------------------------------------------------------------
        */

        $persenSantunanOT = $total
            ? round(($santunanOT / $total) * 100, 2)
            : 0;

        $persenAnakYatim = $total
            ? round(($anakYatim / $total) * 100, 2)
            : 0;

        $persenAnakPiatu = $total
            ? round(($anakPiatu / $total) * 100, 2)
            : 0;

        $persenYatimPiatu = $total
            ? round(($yatimPiatu / $total) * 100, 2)
            : 0;

        /*
        |--------------------------------------------------------------------------
        | REKAP TABEL
        |--------------------------------------------------------------------------
        */

        $rekap = [

            [
                'nama' => 'Santunan OT',
                'jumlah' => $santunanOT,
            ],

            [
                'nama' => 'Anak Yatim',
                'jumlah' => $anakYatim,
            ],

            [
                'nama' => 'Anak Piatu',
                'jumlah' => $anakPiatu,
            ],

            [
                'nama' => 'Yatim Piatu',
                'jumlah' => $yatimPiatu,
            ],

        ];

        /*
        |--------------------------------------------------------------------------
        | NARASI PEMBUKA
        |--------------------------------------------------------------------------
        */

        $intro = "

Berdasarkan data santri yang tercatat pada Sistem Informasi TPQ Khairunissa, terdapat <b>{$total} santri</b> yang tercatat berdasarkan status orang tua.

Data tersebut terdiri dari <b>{$santunanOT}</b> santri dengan status <b>Santunan OT</b>, <b>{$anakYatim}</b> anak yatim, <b>{$anakPiatu}</b> anak piatu, dan <b>{$yatimPiatu}</b> anak yatim piatu.

Data status santri berdasarkan kondisi orang tua disajikan pada tabel berikut.

";

        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA
        |--------------------------------------------------------------------------
        | Analisis dibuat langsung berdasarkan angka pada tabel.
        |--------------------------------------------------------------------------
        */

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data pada tabel, dari jumlah total sebanyak <b>{$total} santri</b> menunjukkan bahwa anak dengan status <b>Santunan OT</b> merupakan kelompok dengan jumlah terbanyak, yaitu <b>{$santunanOT} orang</b>. Sementara itu, terdapat <b>{$anakYatim} anak yatim</b>, <b>{$anakPiatu} anak piatu</b>, dan <b>{$yatimPiatu} anak yatim piatu</b>.

Adapun persentase masing-masing kategori adalah <b>Santunan OT sebesar {$persenSantunanOT}% ({$santunanOT} dari {$total} santri)</b>, <b>Anak Yatim sebesar {$persenAnakYatim}% ({$anakYatim} dari {$total} santri)</b>, <b>Anak Piatu sebesar {$persenAnakPiatu}% ({$anakPiatu} dari {$total} santri)</b>, dan <b>Yatim Piatu sebesar {$persenYatimPiatu}% ({$yatimPiatu} dari {$total} santri)</b>.

Data tersebut memberikan gambaran mengenai kondisi orang tua santri yang tercatat dalam Sistem Informasi TPQ Khairunissa.

";

        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Berdasarkan data pada tabel, kategori <b>Santunan OT</b> merupakan kelompok dengan jumlah santri terbanyak, sedangkan kategori lainnya terdiri dari anak yatim, anak piatu, dan yatim piatu. Data tersebut menjadi gambaran kondisi sosial santri yang perlu diperhatikan dalam penyelenggaraan dan pengelolaan pendidikan di TPQ Khairunissa.

";

        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return [

            'intro' => $intro,

            'rekap' => $rekap,

            'total' => $total,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
