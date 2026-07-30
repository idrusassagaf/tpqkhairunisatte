<?php

namespace App\Services\Report;

class Bab5Report
{
    public function generate($masterData)
    {
        $total = collect($masterData['progres_iqra'])->count();

        $lancar = collect($masterData['progres_iqra'])
            ->where('progres', 'Lancar')
            ->count();

        $belum = collect($masterData['progres_iqra'])
            ->where('progres', 'Belum')
            ->count();

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

        $persenLancar = $total
            ? round(($lancar / $total) * 100, 2)
            : 0;

        $persenBelum = $total
            ? round(($belum / $total) * 100, 2)
            : 0;

        $intro = "

Sebanyak <b>{$total}</b> santri mengikuti program pembelajaran Iqra.

Perkembangan pembelajaran Iqra setiap santri dicatat melalui Sistem Informasi TPQ Khairunissa sehingga perkembangan belajar dapat dipantau secara berkala.

Data progres pembelajaran Iqra disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Hasil analisis menunjukkan bahwa santri dengan progres <b>Lancar</b> sebanyak <b>{$lancar}</b> orang atau <b>{$persenLancar}%</b>, sedangkan santri yang masih memerlukan pendampingan berjumlah <b>{$belum}</b> orang atau <b>{$persenBelum}%</b>.

Data tersebut menunjukkan tingkat capaian pembelajaran Iqra yang menjadi dasar dalam proses evaluasi pembelajaran.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Perkembangan pembelajaran Iqra menunjukkan bahwa sebagian besar santri telah mencapai perkembangan yang baik, sementara santri yang masih memerlukan pendampingan dapat menjadi prioritas pembinaan pada periode berikutnya.

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
