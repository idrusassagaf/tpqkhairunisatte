<?php

namespace App\Services\Report;

class Bab3Report
{
    public function generate($masterData)
    {
        /*
        |--------------------------------------------------------------------------
        | DATA GURU
        |--------------------------------------------------------------------------
        */

        $guruData = collect($masterData['guru']);
        $santriData = collect($masterData['santri']);

        $totalGuru = $guruData->count();
        $totalSantri = $santriData->count();

        /*
        |--------------------------------------------------------------------------
        | GURU BERDASARKAN JENIS KELAMIN
        |--------------------------------------------------------------------------
        */

        $guruLaki = $guruData
            ->where('jenis_kelamin', 'L')
            ->count();

        $guruPerempuan = $guruData
            ->where('jenis_kelamin', 'P')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | PERSENTASE GURU
        |--------------------------------------------------------------------------
        */

        $persenLaki = $totalGuru
            ? round(($guruLaki / $totalGuru) * 100, 2)
            : 0;

        $persenPerempuan = $totalGuru
            ? round(($guruPerempuan / $totalGuru) * 100, 2)
            : 0;

        /*
        |--------------------------------------------------------------------------
        | PERBANDINGAN GURU DAN SANTRI
        |--------------------------------------------------------------------------
        | Rasio dibuat dengan guru sebagai angka 1.
        |
        | Contoh:
        | 8 guru dan 12 santri
        | 12 / 8 = 1,5
        | berarti 1 guru : 1,5 santri
        |--------------------------------------------------------------------------
        */

        if ($totalGuru > 0) {

            $rasioSantriPerGuru = round(
                $totalSantri / $totalGuru,
                2
            );
        } else {

            $rasioSantriPerGuru = 0;
        }

        /*
        |--------------------------------------------------------------------------
        | REKAP DATA GURU
        |--------------------------------------------------------------------------
        */

        $rekap = [

            [
                'nama' => 'Guru Laki-laki',
                'jumlah' => $guruLaki,
            ],

            [
                'nama' => 'Guru Perempuan',
                'jumlah' => $guruPerempuan,
            ],

        ];

        /*
        |--------------------------------------------------------------------------
        | KATEGORI GURU TERBANYAK
        |--------------------------------------------------------------------------
        */

        if ($guruLaki > $guruPerempuan) {

            $kategoriTerbanyak = 'Guru Laki-laki';
            $jumlahTerbanyak = $guruLaki;
        } elseif ($guruPerempuan > $guruLaki) {

            $kategoriTerbanyak = 'Guru Perempuan';
            $jumlahTerbanyak = $guruPerempuan;
        } else {

            $kategoriTerbanyak = 'Guru Laki-laki dan Guru Perempuan';
            $jumlahTerbanyak = $guruLaki;
        }

        /*
        |--------------------------------------------------------------------------
        | NARASI PEMBUKA
        |--------------------------------------------------------------------------
        */

        $intro = "

TPQ Khairunissa memiliki sebanyak <b>{$totalGuru} orang guru</b> yang tercatat dalam Sistem Informasi TPQ Khairunissa. Berdasarkan jenis kelamin, terdiri dari <b>{$guruLaki} guru laki-laki</b> dan <b>{$guruPerempuan} guru perempuan</b>.

Data guru disajikan pada tabel berikut.

";

        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA
        |--------------------------------------------------------------------------
        */

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data pada tabel, dari jumlah total sebanyak <b>{$totalGuru} guru</b> menunjukkan bahwa <b>{$kategoriTerbanyak}</b> merupakan kelompok dengan jumlah terbanyak, yaitu <b>{$jumlahTerbanyak} orang</b>. Sementara itu, terdapat <b>{$guruLaki} guru laki-laki</b> dan <b>{$guruPerempuan} guru perempuan</b>.

Adapun persentase masing-masing kategori adalah <b>Guru Laki-laki sebesar {$persenLaki}% ({$guruLaki} dari {$totalGuru} guru)</b> dan <b>Guru Perempuan sebesar {$persenPerempuan}% ({$guruPerempuan} dari {$totalGuru} guru)</b>.

Berdasarkan jumlah guru dan santri yang tercatat, terdapat <b>{$totalGuru} guru</b> untuk melayani <b>{$totalSantri} santri</b>. Dengan demikian, perbandingan jumlah guru dengan santri adalah <b>1 : {$rasioSantriPerGuru}</b>, atau secara rata-rata <b>1 guru berbanding {$rasioSantriPerGuru} santri</b>.

Perbandingan tersebut memberikan gambaran mengenai ketersediaan tenaga pendidik dalam mendukung pelaksanaan kegiatan pembelajaran di TPQ Khairunissa.

";

        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Berdasarkan data pada tabel, jumlah tenaga pendidik yang tercatat di TPQ Khairunissa sebanyak <b>{$totalGuru} guru</b>, yang terdiri dari <b>{$guruLaki} guru laki-laki</b> dan <b>{$guruPerempuan} guru perempuan</b>.

Dengan jumlah santri sebanyak <b>{$totalSantri} orang</b>, perbandingan guru dan santri adalah <b>1 : {$rasioSantriPerGuru}</b>. Kondisi tersebut menjadi gambaran mengenai ketersediaan tenaga pendidik dalam mendukung proses pembelajaran dan pendampingan santri.

";

        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return [

            'intro' => $intro,

            'rekap' => $rekap,

            'total' => $totalGuru,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
