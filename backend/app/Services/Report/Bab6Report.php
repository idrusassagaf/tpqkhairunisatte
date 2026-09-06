<?php

namespace App\Services\Report;

class Bab6Report
{
    public function generate($masterData)
    {
        $data = collect($masterData['progres_quran']);

        /*
        |--------------------------------------------------------------------------
        | DATA DASAR PROGRES AL-QUR'AN
        |--------------------------------------------------------------------------
        */

        $total = $data->count();

        $lancar = $data
            ->where('progres', 'Lancar')
            ->count();

        $belum = $data
            ->where('progres', 'Belum')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | REKAP
        |--------------------------------------------------------------------------
        */

        $rekap = [

            [
                'nama' => 'Lancar',
                'jumlah' => $lancar,
            ],

            [
                'nama' => 'Belum Lancar',
                'jumlah' => $belum,
            ],

        ];

        /*
        |--------------------------------------------------------------------------
        | PERSENTASE
        |--------------------------------------------------------------------------
        */

        $persenLancar = $total
            ? round(($lancar / $total) * 100, 2)
            : 0;

        $persenBelum = $total
            ? round(($belum / $total) * 100, 2)
            : 0;

        /*
        |--------------------------------------------------------------------------
        | RASIO
        |--------------------------------------------------------------------------
        */

        if ($belum > 0) {

            $rasioLancarBelum =
                round($lancar / $belum, 2) . " : 1";
        } else {

            $rasioLancarBelum = $lancar > 0
                ? $lancar . " : 0"
                : "-";
        }

        /*
        |--------------------------------------------------------------------------
        | NARASI PEMBUKA
        |--------------------------------------------------------------------------
        */

        $intro = "

Sebanyak <b>{$total}</b> data progres santri tercatat dalam program pembelajaran Al-Qur'an.

Perkembangan pembelajaran Al-Qur'an setiap santri dicatat melalui Sistem Informasi TPQ Khairunissa sehingga perkembangan belajar dapat dipantau dan dievaluasi secara berkala.

Berdasarkan data yang tersedia, terdapat <b>{$lancar}</b> santri dengan progres <b>Lancar</b> dan <b>{$belum}</b> santri yang masih berstatus <b>Belum Lancar</b>.

Data progres pembelajaran Al-Qur'an disajikan pada tabel berikut.

";

        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA
        |--------------------------------------------------------------------------
        */

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data pada tabel, dari jumlah keseluruhan sebanyak <b>{$total}</b> data progres pembelajaran Al-Qur'an, terdapat <b>{$lancar}</b> santri atau sebesar <b>{$persenLancar}%</b> yang memiliki progres <b>Lancar</b>.

Sementara itu, terdapat <b>{$belum}</b> santri atau sebesar <b>{$persenBelum}%</b> yang masih berstatus <b>Belum Lancar</b> dan memerlukan pendampingan serta pembinaan dalam proses pembelajaran.

Perbandingan antara santri dengan progres Lancar dan Belum Lancar adalah sebesar <b>{$rasioLancarBelum}</b>. Komposisi tersebut memberikan gambaran mengenai perkembangan pembelajaran Al-Qur'an yang tercatat dalam Sistem Informasi TPQ Khairunissa.

";

        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Berdasarkan data progres pembelajaran Al-Qur'an, perkembangan santri dapat dipantau melalui pencatatan progres secara berkala. Santri yang telah mencapai status <b>Lancar</b> dapat terus mempertahankan dan meningkatkan kemampuan membaca Al-Qur'an, sedangkan santri yang masih berstatus <b>Belum Lancar</b> perlu mendapatkan pendampingan dan pembinaan secara berkelanjutan.

Data progres ini dapat menjadi salah satu dasar bagi guru dan pengelola TPQ Khairunissa dalam melakukan evaluasi serta menentukan tindak lanjut pembelajaran pada periode berikutnya.

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
