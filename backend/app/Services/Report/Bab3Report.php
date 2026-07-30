<?php

namespace App\Services\Report;

class Bab3Report
{
    public function generate($masterData)
    {
        $guru = collect($masterData['guru'])->count();

        $laki = collect($masterData['guru'])
            ->where('jenis_kelamin', 'L')
            ->count();

        $perempuan = collect($masterData['guru'])
            ->where('jenis_kelamin', 'P')
            ->count();

        $rekap = [

            [
                'nama' => 'Guru Laki-laki',
                'jumlah' => $laki,
            ],

            [
                'nama' => 'Guru Perempuan',
                'jumlah' => $perempuan,
            ],

        ];

        $persenL = $guru
            ? round(($laki / $guru) * 100, 2)
            : 0;

        $persenP = $guru
            ? round(($perempuan / $guru) * 100, 2)
            : 0;

        $intro = "

TPQ Khairunissa saat ini memiliki <b>{$guru}</b> orang guru yang aktif melaksanakan kegiatan pembelajaran. Seluruh guru berperan sebagai pendidik dan pembimbing santri sesuai dengan jenjang pembelajaran yang telah ditetapkan.

Data guru disajikan pada tabel berikut.

";

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data guru yang tersedia, terdapat <b>{$laki}</b> guru laki-laki atau sebesar <b>{$persenL}%</b>, sedangkan guru perempuan berjumlah <b>{$perempuan}</b> orang atau sebesar <b>{$persenP}%</b>.

Komposisi tersebut menunjukkan sebaran tenaga pendidik yang mendukung proses pembelajaran di TPQ Khairunissa.

";

        $conclusion = "

<b>Kesimpulan</b><br><br>

Jumlah tenaga pendidik yang tersedia telah menjadi bagian penting dalam mendukung penyelenggaraan proses belajar mengajar. Data guru yang tersimpan pada sistem menjadi dasar dalam pengelolaan kelas dan pembagian tugas mengajar.

";

        return [

            'intro' => $intro,

            'rekap' => $rekap,

            'total' => $guru,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
