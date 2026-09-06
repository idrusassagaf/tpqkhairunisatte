<?php

namespace App\Services\Report;

class Bab8Report
{
    public function generate($masterData)
    {
        /*
        |--------------------------------------------------------------------------
        | DATA UTAMA
        |--------------------------------------------------------------------------
        */

        $santriData = collect($masterData['santri']);
        $guruData = collect($masterData['guru']);

        $progresIqraData = collect($masterData['progres_iqra']);
        $progresQuranData = collect($masterData['progres_quran']);
        $progresHafalanData = collect($masterData['progres_hafalan']);


        $santri = $santriData->count();
        $guru = $guruData->count();

        $totalIqra = $progresIqraData->count();
        $totalQuran = $progresQuranData->count();
        $totalHafalan = $progresHafalanData->count();


        /*
        |--------------------------------------------------------------------------
        | RASIO SANTRI / GURU
        |--------------------------------------------------------------------------
        */

        $rasioGuru = $guru
            ? round($santri / $guru, 1)
            : 0;


        /*
        |--------------------------------------------------------------------------
        | PROGRES IQRA
        |--------------------------------------------------------------------------
        */

        $iqraLancar = $progresIqraData
            ->where('progres', 'Lancar')
            ->count();

        $iqraBelum = $progresIqraData
            ->where('progres', 'Belum')
            ->count();

        $persenIqraLancar = $totalIqra
            ? round(($iqraLancar / $totalIqra) * 100, 2)
            : 0;

        $persenIqraBelum = $totalIqra
            ? round(($iqraBelum / $totalIqra) * 100, 2)
            : 0;


        /*
        |--------------------------------------------------------------------------
        | PROGRES AL-QUR'AN
        |--------------------------------------------------------------------------
        */

        $quranLancar = $progresQuranData
            ->where('progres', 'Lancar')
            ->count();

        $quranBelum = $progresQuranData
            ->where('progres', 'Belum')
            ->count();

        $persenQuranLancar = $totalQuran
            ? round(($quranLancar / $totalQuran) * 100, 2)
            : 0;

        $persenQuranBelum = $totalQuran
            ? round(($quranBelum / $totalQuran) * 100, 2)
            : 0;


        /*
        |--------------------------------------------------------------------------
        | PROGRES HAFALAN
        |--------------------------------------------------------------------------
        */

        $hafalanLancar = $progresHafalanData
            ->where('progres', 'Lancar')
            ->count();

        $hafalanBelum = $progresHafalanData
            ->where('progres', 'Belum')
            ->count();

        $persenHafalanLancar = $totalHafalan
            ? round(($hafalanLancar / $totalHafalan) * 100, 2)
            : 0;

        $persenHafalanBelum = $totalHafalan
            ? round(($hafalanBelum / $totalHafalan) * 100, 2)
            : 0;


        /*
        |--------------------------------------------------------------------------
        | REKAP DATA UTAMA
        |--------------------------------------------------------------------------
        */

        $rekap = [

            [
                'nama' => 'Jumlah Santri',
                'jumlah' => $santri,
            ],

            [
                'nama' => 'Jumlah Guru',
                'jumlah' => $guru,
            ],

            [
                'nama' => 'Rasio Santri / Guru',
                'jumlah' => $guru
                    ? "1 : {$rasioGuru}"
                    : "-",
            ],

            [
                'nama' => 'Data Progres Iqra',
                'jumlah' => $totalIqra,
            ],

            [
                'nama' => 'Data Progres Al-Qur\'an',
                'jumlah' => $totalQuran,
            ],

            [
                'nama' => 'Data Progres Hafalan',
                'jumlah' => $totalHafalan,
            ],

        ];


        /*
        |--------------------------------------------------------------------------
        | INTRO
        |--------------------------------------------------------------------------
        */

        $intro = "

Bab ini merupakan rangkuman akhir dari seluruh data
yang telah disajikan pada laporan.

Berdasarkan data yang tersimpan dalam Sistem Informasi
Manajemen TPQ Khairunissa, laporan ini menggambarkan
kondisi santri, guru, serta perkembangan proses
pembelajaran secara menyeluruh.

Ringkasan data utama disajikan pada tabel berikut.

";


        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA
        |--------------------------------------------------------------------------
        */

        $analysis = "

<b>Analisis Data</b><br><br>

Berdasarkan data yang tersedia, TPQ Khairunissa saat ini
mengelola sebanyak <b>{$santri}</b> santri dengan dukungan
<b>{$guru}</b> guru.

Perbandingan jumlah santri dengan guru menunjukkan rasio
sebesar <b>1 : {$rasioGuru}</b>. Dengan demikian, secara
rata-rata satu guru menangani sekitar <b>{$rasioGuru}</b>
santri berdasarkan jumlah data yang tercatat.

Pada program pembelajaran Iqra terdapat sebanyak
<b>{$totalIqra}</b> data progres. Dari jumlah tersebut,
<b>{$iqraLancar}</b> data atau <b>{$persenIqraLancar}%</b>
berstatus <b>Lancar</b>, sedangkan
<b>{$iqraBelum}</b> data atau <b>{$persenIqraBelum}%</b>
masih berstatus <b>Belum</b>.

Pada program pembelajaran Al-Qur'an terdapat sebanyak
<b>{$totalQuran}</b> data progres. Sebanyak
<b>{$quranLancar}</b> data atau <b>{$persenQuranLancar}%</b>
berstatus <b>Lancar</b>, sedangkan
<b>{$quranBelum}</b> data atau <b>{$persenQuranBelum}%</b>
masih berstatus <b>Belum</b>.

Sementara itu, pada program hafalan terdapat sebanyak
<b>{$totalHafalan}</b> data. Sebanyak
<b>{$hafalanLancar}</b> data atau <b>{$persenHafalanLancar}%</b>
berstatus <b>Lancar</b>, sedangkan
<b>{$hafalanBelum}</b> data atau <b>{$persenHafalanBelum}%</b>
masih berstatus <b>Belum</b>.

Secara keseluruhan, data tersebut menunjukkan bahwa
Sistem Informasi Manajemen TPQ Khairunissa telah
menghimpun informasi utama mengenai peserta didik,
tenaga pengajar, serta perkembangan pembelajaran
sebagai bahan pemantauan dan evaluasi.

";


        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        $conclusion = "

<b>Kesimpulan</b><br><br>

Berdasarkan keseluruhan data yang disajikan dalam laporan,
TPQ Khairunissa memiliki <b>{$santri}</b> santri dan
<b>{$guru}</b> guru dengan rasio rata-rata
<b>1 : {$rasioGuru}</b>.

Data progres Iqra, Al-Qur'an, dan hafalan memberikan
gambaran mengenai perkembangan pembelajaran santri
berdasarkan status progres yang tercatat dalam sistem.

Informasi tersebut dapat digunakan sebagai dasar evaluasi
untuk mengetahui perkembangan pembelajaran, menentukan
prioritas pendampingan, serta menyusun program pembinaan
yang lebih tepat pada periode berikutnya.

Seluruh data dalam laporan dihasilkan berdasarkan data
yang tersimpan pada Sistem Informasi Manajemen TPQ
Khairunissa sehingga dapat diperbarui secara otomatis
mengikuti perubahan data pada sistem.

";


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return [

            'intro' => $intro,

            'rekap' => $rekap,

            'totalSantri' => $santri,

            'totalGuru' => $guru,

            'rasioGuru' => $rasioGuru,

            'totalIqra' => $totalIqra,

            'iqraLancar' => $iqraLancar,

            'iqraBelum' => $iqraBelum,

            'persenIqraLancar' => $persenIqraLancar,

            'persenIqraBelum' => $persenIqraBelum,

            'totalQuran' => $totalQuran,

            'quranLancar' => $quranLancar,

            'quranBelum' => $quranBelum,

            'persenQuranLancar' => $persenQuranLancar,

            'persenQuranBelum' => $persenQuranBelum,

            'totalHafalan' => $totalHafalan,

            'hafalanLancar' => $hafalanLancar,

            'hafalanBelum' => $hafalanBelum,

            'persenHafalanLancar' => $persenHafalanLancar,

            'persenHafalanBelum' => $persenHafalanBelum,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
