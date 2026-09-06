<?php

namespace App\Services\Report;

class Bab5Report
{
    public function generate($masterData)
    {
        $data = collect($masterData['progres_iqra']);

        $total = $data->count();

        $lancar = $data
            ->where('progres', 'Lancar')
            ->count();

        $belum = $data
            ->where('progres', 'Belum')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | REKAP PROGRES IQRA
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

Sebanyak <b>{$total}</b> santri tercatat dalam program pembelajaran Iqra pada Sistem Informasi TPQ Khairunissa.

Perkembangan pembelajaran Iqra setiap santri dicatat melalui sistem sehingga perkembangan belajar dapat dipantau dan dievaluasi secara berkala.

Berdasarkan data yang tersedia, terdapat <b>{$lancar}</b> santri dengan progres <b>Lancar</b> dan <b>{$belum}</b> santri yang masih berstatus <b>Belum Lancar</b>.

Data progres pembelajaran Iqra disajikan pada tabel berikut.

";

        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA
        |--------------------------------------------------------------------------
        */

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan hasil analisis data pada tabel di atas, dari jumlah keseluruhan sebanyak <b>{$total}</b> data progres pembelajaran Iqra, terdapat <b>{$lancar}</b> santri atau sebesar <b>{$persenLancar}%</b> yang memiliki progres <b>Lancar</b>.

Sementara itu, terdapat <b>{$belum}</b> santri atau sebesar <b>{$persenBelum}%</b> yang masih berstatus <b>Belum Lancar</b> dan masih memerlukan pendampingan dalam proses pembelajaran.

Perbandingan antara santri dengan progres Lancar dan Belum Lancar adalah sebesar <b>{$rasioLancarBelum}</b>. Kondisi ini memberikan gambaran mengenai tingkat perkembangan pembelajaran Iqra yang tercatat dalam sistem.

";

        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Berdasarkan data progres pembelajaran Iqra, capaian santri menunjukkan adanya perkembangan pembelajaran yang dapat dipantau melalui sistem. Santri yang telah mencapai status <b>Lancar</b> dapat terus mempertahankan dan meningkatkan kemampuan membaca Al-Qur'an, sedangkan santri yang masih berstatus <b>Belum Lancar</b> perlu mendapatkan perhatian dan pendampingan secara berkelanjutan.

Data progres ini dapat menjadi salah satu dasar bagi pengelola dan guru TPQ Khairunissa dalam melakukan evaluasi serta menentukan tindak lanjut pembelajaran pada periode berikutnya.

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
