<?php

namespace App\Services\Report;

class Bab2Report
{
    public function generate($masterData)
    {
        $aktif = collect($masterData['santri'])
            ->where('status_santri', 'Aktif')
            ->count();

        $nonaktif = collect($masterData['santri'])
            ->where('status_santri', 'Nonaktif')
            ->count();

        $lulus = collect($masterData['santri'])
            ->where('status_santri', 'Lulus')
            ->count();

        $total = $aktif + $nonaktif + $lulus;

        $rekap = [

            [
                'nama' => 'Aktif',
                'jumlah' => $aktif,
            ],

            [
                'nama' => 'Nonaktif',
                'jumlah' => $nonaktif,
            ],

            [
                'nama' => 'Lulus',
                'jumlah' => $lulus,
            ],

        ];

        $persenAktif = $total ? round(($aktif / $total) * 100, 2) : 0;
        $persenNonaktif = $total ? round(($nonaktif / $total) * 100, 2) : 0;
        $persenLulus = $total ? round(($lulus / $total) * 100, 2) : 0;

        $intro = "

Status santri berdasarkan data pada Sistem Informasi TPQ Khairunissa menunjukkan bahwa terdapat <b>{$aktif}</b> santri aktif, <b>{$nonaktif}</b> santri nonaktif, dan <b>{$lulus}</b> santri yang telah dinyatakan lulus.

Data status santri disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan hasil analisis, santri aktif mendominasi dengan persentase <b>{$persenAktif}%</b>, sedangkan santri nonaktif sebesar <b>{$persenNonaktif}%</b> dan santri lulus sebesar <b>{$persenLulus}%</b>.

Komposisi tersebut menunjukkan kondisi terkini administrasi santri yang tercatat dalam sistem.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Status santri pada TPQ Khairunissa menunjukkan bahwa sebagian besar santri masih aktif mengikuti proses pembelajaran, sedangkan sebagian lainnya telah menyelesaikan pendidikan atau tidak lagi aktif.

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
