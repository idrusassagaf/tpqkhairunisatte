<?php

namespace App\Services\Report;

class Bab7Report
{
    public function generate($masterData)
    {
        $total = collect($masterData['progres_hafalan'])->count();

        $lancar = collect($masterData['progres_hafalan'])
            ->where('progres', 'Lancar')
            ->count();

        $belum = collect($masterData['progres_hafalan'])
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

Program hafalan Al-Qur'an diikuti oleh <b>{$total}</b> santri.

Seluruh perkembangan hafalan dicatat melalui Sistem Informasi TPQ Khairunissa sehingga pencapaian setiap santri dapat dipantau secara berkala.

Data perkembangan hafalan disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Hasil analisis menunjukkan bahwa santri dengan progres hafalan <b>Lancar</b> sebanyak <b>{$lancar}</b> orang atau <b>{$persenLancar}%</b>, sedangkan santri yang masih memerlukan pembinaan sebanyak <b>{$belum}</b> orang atau <b>{$persenBelum}%</b>.

Komposisi tersebut memberikan gambaran tingkat keberhasilan program hafalan yang sedang berjalan di TPQ Khairunissa.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Program hafalan Al-Qur'an telah berjalan dengan baik. Data perkembangan hafalan dapat menjadi dasar dalam menentukan strategi pembinaan agar seluruh santri mampu mencapai target hafalan sesuai jenjang pembelajaran.

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
