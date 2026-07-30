<?php

namespace App\Services\Report;

class Bab1Report
{
    public function generate($masterData)
    {
        $total = count($masterData['santri']);

        $laki = collect($masterData['santri'])
            ->where('jenis_kelamin', 'L')
            ->count();

        $perempuan = collect($masterData['santri'])
            ->where('jenis_kelamin', 'P')
            ->count();

        $iqra = collect($masterData['santri'])
            ->where('kelas', 'Iqra')
            ->count();

        $quran = collect($masterData['santri'])
            ->filter(function ($s) {
                return in_array($s->kelas, [
                    'Al Quran',
                    'AlQuran',
                    "Al-Qur'an"
                ]);
            })
            ->count();

        $persenL = $total ? round(($laki / $total) * 100, 2) : 0;
        $persenP = $total ? round(($perempuan / $total) * 100, 2) : 0;

        $persenIqra = $total ? round(($iqra / $total) * 100, 2) : 0;
        $persenQuran = $total ? round(($quran / $total) * 100, 2) : 0;

        $rasioGender = $perempuan > 0
            ? round($laki / $perempuan, 2) . " : 1"
            : "-";

        $rasioKelas = $quran > 0
            ? round($iqra / $quran, 2) . " : 1"
            : "-";

        // ========================================
        // REKAP SANTRI
        // ========================================

        $rekap = [];

        foreach (
            [
                'Al Quran',
                'Iqra 1',
                'Iqra 2',
                'Iqra 3',
                'Iqra 4',
                'Iqra 5',
                'Iqra 6'
            ] as $kelas
        ) {

            $l = 0;
            $p = 0;

            foreach ($masterData['santri'] as $santri) {

                if ($kelas == 'Al Quran') {

                    if (trim($santri->kelas) != 'Al Quran') {
                        continue;
                    }
                } else {

                    $progres = collect($masterData['progres_iqra'])
                        ->firstWhere('nis', $santri->nis);

                    if (!$progres) {
                        continue;
                    }

                    if (trim($progres->jilid) != $kelas) {
                        continue;
                    }
                }

                if ($santri->jenis_kelamin == 'L') {
                    $l++;
                }

                if ($santri->jenis_kelamin == 'P') {
                    $p++;
                }
            }

            $rekap[] = [
                'nama' => $kelas,
                'l' => $l,
                'p' => $p,
                'j' => $l + $p,
            ];
        }

        $totalL = array_sum(array_column($rekap, 'l'));
        $totalP = array_sum(array_column($rekap, 'p'));
        $totalRekap = $totalL + $totalP;

        $intro = "

Jumlah santri yang terdaftar sebanyak <b>{$total}</b> orang.

Terdiri dari <b>{$laki}</b> santri laki-laki dan
<b>{$perempuan}</b> santri perempuan.

Sebanyak <b>{$iqra}</b> santri berada pada kelas Iqra
dan <b>{$quran}</b> santri berada pada kelas Al-Qur'an.

Data santri beserta kelas pembelajaran dapat dilihat pada tabel berikut.

";

        /*
            |--------------------------------------------------------------------------
            | Analisis
            |--------------------------------------------------------------------------
            */

        $analysis = "

<b>Analisis Data</b><br><br>

Dari hasil analisis berdasarkan data pada tabel di atas menunjukan bahwa prosentase santri laki-laki sebesar <b>{$persenL}%</b>, sedangkan santri perempuan sebesar <b>{$persenP}%</b> dengan perbandingan <b>{$rasioGender}</b>.

Selanjutnya berdasarkan jenjang pembelajaran, santri yang masih berada pada kelas Iqra sebanyak <b>{$iqra}</b> orang atau <b>{$persenIqra}%</b>, sedangkan santri pada kelas Al-Qur'an sebanyak <b>{$quran}</b> orang atau <b>{$persenQuran}%</b>.

Perbandingan jumlah santri antara kelas Iqra dan Al-Qur'an sebesar <b>{$rasioKelas}</b>. Kondisi ini menunjukkan komposisi santri pada kedua jenjang pembelajaran masih relatif proporsional.

";

        /*
            |--------------------------------------------------------------------------
            | Kesimpulan
            |--------------------------------------------------------------------------
            */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Komposisi santri berdasarkan jenis kelamin maupun jenjang pembelajaran menunjukkan kondisi yang cukup riil. Hal lainnya menunjukkan proses pembelajaran di TPQ Khairunissa berjalan secara berkesinambungan mulai dari kelas Iqra hingga Al-Qur'an.

";

        return [

            'intro' => $intro,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

            'rekap' => $rekap,

            'totalL' => $totalL,

            'totalP' => $totalP,

            'total' => $totalRekap,

        ];
    }
}
