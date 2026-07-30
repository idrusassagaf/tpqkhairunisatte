<?php

namespace App\Services\Report;

class Bab6Report
{
    public function generate($masterData)
    {
        $total = collect($masterData['progres_quran'])->count();

        $lancar = collect($masterData['progres_quran'])
            ->where('progres', 'Lancar')
            ->count();

        $belum = collect($masterData['progres_quran'])
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

Sebanyak <b>{$total}</b> santri mengikuti program pembelajaran Al-Qur'an.

Perkembangan pembelajaran Al-Qur'an setiap santri dicatat melalui Sistem Informasi TPQ Khairunissa sehingga proses evaluasi pembelajaran dapat dilakukan secara berkelanjutan.

Data progres pembelajaran Al-Qur'an disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Hasil analisis menunjukkan bahwa santri dengan progres <b>Lancar</b> sebanyak <b>{$lancar}</b> orang atau <b>{$persenLancar}%</b>, sedangkan santri yang masih memerlukan pembinaan berjumlah <b>{$belum}</b> orang atau <b>{$persenBelum}%</b>.

Komposisi tersebut memberikan gambaran mengenai tingkat keberhasilan proses pembelajaran Al-Qur'an di TPQ Khairunissa.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Secara umum perkembangan pembelajaran Al-Qur'an menunjukkan hasil yang baik. Data progres ini dapat menjadi dasar dalam penyusunan program pembinaan lanjutan bagi santri yang masih memerlukan pendampingan.

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
