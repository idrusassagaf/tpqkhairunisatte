<?php

namespace App\Services\Report;

class Bab4Report
{
    public function generate($masterData)
    {
        $guru = collect($masterData['guru']);

        /*
        |--------------------------------------------------------------------------
        | DATA DASAR GURU
        |--------------------------------------------------------------------------
        */

        $totalGuru = $guru->count();

        $guruLaki = $guru
            ->where('jenis_kelamin', 'L')
            ->count();

        $guruPerempuan = $guru
            ->where('jenis_kelamin', 'P')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | PERSENTASE JENIS KELAMIN
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
        | REKAP PENDIDIKAN
        |--------------------------------------------------------------------------
        */

        $rekapPendidikan = $guru
            ->groupBy(function ($item) {
                return $item->pendidikan ?: '-';
            })
            ->map(function ($items, $pendidikan) use ($totalGuru) {
                $jumlah = $items->count();

                return [
                    'nama' => $pendidikan,
                    'jumlah' => $jumlah,
                    'persentase' => $totalGuru
                        ? round(($jumlah / $totalGuru) * 100, 2)
                        : 0,
                ];
            })
            ->values()
            ->toArray();

        /*
        |--------------------------------------------------------------------------
        | REKAP PEKERJAAN
        |--------------------------------------------------------------------------
        */

        $rekapPekerjaan = $guru
            ->groupBy(function ($item) {
                return $item->pekerjaan ?: '-';
            })
            ->map(function ($items, $pekerjaan) use ($totalGuru) {
                $jumlah = $items->count();

                return [
                    'nama' => $pekerjaan,
                    'jumlah' => $jumlah,
                    'persentase' => $totalGuru
                        ? round(($jumlah / $totalGuru) * 100, 2)
                        : 0,
                ];
            })
            ->values()
            ->toArray();

        /*
        |--------------------------------------------------------------------------
        | PENDIDIKAN TERBANYAK
        |--------------------------------------------------------------------------
        */

        $pendidikanTerbanyak = collect($rekapPendidikan)
            ->sortByDesc('jumlah')
            ->first();

        $namaPendidikanTerbanyak = $pendidikanTerbanyak['nama'] ?? '-';
        $jumlahPendidikanTerbanyak = $pendidikanTerbanyak['jumlah'] ?? 0;
        $persenPendidikanTerbanyak = $pendidikanTerbanyak['persentase'] ?? 0;

        /*
        |--------------------------------------------------------------------------
        | PEKERJAAN TERBANYAK
        |--------------------------------------------------------------------------
        */

        $pekerjaanTerbanyak = collect($rekapPekerjaan)
            ->sortByDesc('jumlah')
            ->first();

        $namaPekerjaanTerbanyak = $pekerjaanTerbanyak['nama'] ?? '-';
        $jumlahPekerjaanTerbanyak = $pekerjaanTerbanyak['jumlah'] ?? 0;
        $persenPekerjaanTerbanyak = $pekerjaanTerbanyak['persentase'] ?? 0;

        /*
        |--------------------------------------------------------------------------
        | NARASI PEMBUKA
        |--------------------------------------------------------------------------
        */

        $intro = "

Berdasarkan data yang tersimpan dalam Sistem Informasi TPQ Khairunissa, profil tenaga pendidik terdiri atas informasi jumlah guru berdasarkan jenis kelamin, pendidikan, dan pekerjaan. Data tersebut memberikan gambaran mengenai komposisi dan karakteristik tenaga pendidik yang mendukung kegiatan pembelajaran di TPQ Khairunissa.

Data profil guru disajikan pada tabel berikut.

";

        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA
        |--------------------------------------------------------------------------
        */

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data pada tabel, jumlah tenaga pendidik TPQ Khairunissa sebanyak <b>{$totalGuru} guru</b>, yang terdiri dari <b>{$guruLaki} guru laki-laki</b> dan <b>{$guruPerempuan} guru perempuan</b>. Guru laki-laki memiliki persentase sebesar <b>{$persenLaki}%</b> dari seluruh guru, sedangkan guru perempuan sebesar <b>{$persenPerempuan}%</b>.

Dari aspek pendidikan, kategori pendidikan dengan jumlah terbanyak adalah <b>{$namaPendidikanTerbanyak}</b>, yaitu sebanyak <b>{$jumlahPendidikanTerbanyak} guru</b> atau sebesar <b>{$persenPendidikanTerbanyak}%</b> dari total guru. Data tersebut menunjukkan komposisi latar belakang pendidikan tenaga pendidik yang tercatat dalam sistem.

Sementara itu, dari aspek pekerjaan, kategori pekerjaan dengan jumlah terbanyak adalah <b>{$namaPekerjaanTerbanyak}</b>, yaitu sebanyak <b>{$jumlahPekerjaanTerbanyak} guru</b> atau sebesar <b>{$persenPekerjaanTerbanyak}%</b> dari total guru. Komposisi pekerjaan tersebut memberikan gambaran mengenai latar belakang pekerjaan para tenaga pendidik TPQ Khairunissa.

";

        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Berdasarkan profil guru yang tercatat, TPQ Khairunissa memiliki <b>{$totalGuru} tenaga pendidik</b> dengan komposisi jenis kelamin, pendidikan, dan pekerjaan yang beragam. Kelompok pendidikan terbanyak adalah <b>{$namaPendidikanTerbanyak}</b> dengan jumlah <b>{$jumlahPendidikanTerbanyak} guru</b>, sedangkan kelompok pekerjaan terbanyak adalah <b>{$namaPekerjaanTerbanyak}</b> dengan jumlah <b>{$jumlahPekerjaanTerbanyak} guru</b>. Data profil ini dapat menjadi gambaran dasar dalam melihat komposisi tenaga pendidik yang tersedia di TPQ Khairunissa.

";

        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return [

            'intro' => $intro,

            'total' => $totalGuru,

            'guru_laki' => $guruLaki,

            'guru_perempuan' => $guruPerempuan,

            'persen_laki' => $persenLaki,

            'persen_perempuan' => $persenPerempuan,

            'rekap_pendidikan' => $rekapPendidikan,

            'rekap_pekerjaan' => $rekapPekerjaan,

            'pendidikan_terbanyak' => $pendidikanTerbanyak,

            'pekerjaan_terbanyak' => $pekerjaanTerbanyak,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
