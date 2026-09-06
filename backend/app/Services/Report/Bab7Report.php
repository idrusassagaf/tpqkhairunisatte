<?php

namespace App\Services\Report;

class Bab7Report
{
    public function generate($masterData)
    {
        $data = collect($masterData['progres_hafalan']);

        /*
        |--------------------------------------------------------------------------
        | DATA DASAR
        |--------------------------------------------------------------------------
        */

        $total = $data->count();

        $lancar = $data
            ->where('progres', 'Lancar')
            ->count();

        $belum = $data
            ->where('progres', 'Belum')
            ->count();


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
        | RASIO LANCAR : BELUM
        |--------------------------------------------------------------------------
        */

        if ($belum > 0) {

            $rasioLancarBelum =
                round($lancar / $belum, 2) . " : 1";
        } else {

            $rasioLancarBelum =
                $lancar > 0
                ? $lancar . " : 0"
                : "-";
        }


        /*
        |--------------------------------------------------------------------------
        | REKAP PER JENIS HAFALAN
        |--------------------------------------------------------------------------
        */

        $jenisHafalan = $data
            ->pluck('jenis_hafalan')
            ->filter()
            ->unique()
            ->sort()
            ->values();


        $rekapJenis = [];

        foreach ($jenisHafalan as $jenis) {

            $items = $data
                ->where('jenis_hafalan', $jenis);

            $jumlahLancar = $items
                ->where('progres', 'Lancar')
                ->count();

            $jumlahBelum = $items
                ->where('progres', 'Belum')
                ->count();

            $jumlah = $items->count();

            $persenJenisLancar = $jumlah
                ? round(($jumlahLancar / $jumlah) * 100, 2)
                : 0;

            $persenJenisBelum = $jumlah
                ? round(($jumlahBelum / $jumlah) * 100, 2)
                : 0;

            $rekapJenis[] = [

                'nama' => $jenis,

                'lancar' => $jumlahLancar,

                'belum' => $jumlahBelum,

                'jumlah' => $jumlah,

                'persen_lancar' => $persenJenisLancar,

                'persen_belum' => $persenJenisBelum,

            ];
        }


        /*
        |--------------------------------------------------------------------------
        | JENIS HAFALAN TERBANYAK
        |--------------------------------------------------------------------------
        */

        $jenisTerbanyak = '-';

        $jumlahJenisTerbanyak = 0;

        if (!empty($rekapJenis)) {

            $terbanyak = collect($rekapJenis)
                ->sortByDesc('jumlah')
                ->first();

            if ($terbanyak) {

                $jenisTerbanyak = $terbanyak['nama'];

                $jumlahJenisTerbanyak = $terbanyak['jumlah'];
            }
        }


        /*
        |--------------------------------------------------------------------------
        | ANALISIS DATA PER JENIS HAFALAN
        |--------------------------------------------------------------------------
        */

        $analisisJenis = '';

        foreach ($rekapJenis as $item) {

            $analisisJenis .= "
                Pada jenis hafalan <b>{$item['nama']}</b>,
                terdapat <b>{$item['jumlah']}</b> data hafalan,
                dengan <b>{$item['lancar']}</b> data atau
                <b>{$item['persen_lancar']}%</b> berstatus <b>Lancar</b>
                dan <b>{$item['belum']}</b> data atau
                <b>{$item['persen_belum']}%</b> berstatus <b>Belum</b>.
            ";
        }


        /*
        |--------------------------------------------------------------------------
        | INTRO
        |--------------------------------------------------------------------------
        */

        $intro = "

Program hafalan Al-Qur'an diikuti oleh
<b>{$total}</b> data hafalan santri.

Seluruh perkembangan hafalan dicatat melalui
Sistem Informasi TPQ Khairunissa sehingga pencapaian
setiap santri dapat dipantau secara berkala.

Data perkembangan hafalan disajikan berdasarkan
jenis hafalan dan status progres pembelajaran.

";


        /*
        |--------------------------------------------------------------------------
        | ANALISIS
        |--------------------------------------------------------------------------
        */

        if ($total > 0) {

            $analisisUtama = "

Berdasarkan data pada tabel, dari keseluruhan
<b>{$total}</b> data hafalan santri terdapat
<b>{$lancar}</b> data dengan progres <b>Lancar</b>
atau sebesar <b>{$persenLancar}%</b>.

Sementara itu, terdapat <b>{$belum}</b> data dengan
status <b>Belum</b> atau sebesar <b>{$persenBelum}%</b>.

Perbandingan antara data hafalan yang berstatus
Lancar dan Belum adalah sebesar
<b>{$rasioLancarBelum}</b>.

";
        } else {

            $analisisUtama = "

Belum terdapat data progres hafalan santri yang
tersedia untuk dianalisis pada periode laporan ini.

";
        }


        $analysis = "

<b>Analisis Data</b><br><br>

{$analisisUtama}

{$analisisJenis}

";


        /*
        |--------------------------------------------------------------------------
        | KESIMPULAN
        |--------------------------------------------------------------------------
        */

        if ($total > 0 && $belum == 0) {

            $kesimpulanUtama = "

Seluruh data hafalan yang tercatat berada pada status
<b>Lancar</b>. Kondisi ini menunjukkan perkembangan
hafalan yang sangat baik berdasarkan data yang tersedia.

";
        } elseif ($total > 0) {

            $kesimpulanUtama = "

Data menunjukkan bahwa sebagian santri telah mencapai
status <b>Lancar</b>, sementara sebagian lainnya masih
berstatus <b>Belum</b>.

Data tersebut dapat menjadi dasar evaluasi dan pembinaan
lebih lanjut agar perkembangan hafalan santri dapat
meningkat secara bertahap dan merata.

";
        } else {

            $kesimpulanUtama = "

Belum terdapat data progres hafalan yang dapat dijadikan
dasar evaluasi pada laporan ini.

";
        }


        $conclusion = "

<b>Kesimpulan</b><br><br>

{$kesimpulanUtama}

Jenis hafalan dengan jumlah data terbanyak adalah
<b>{$jenisTerbanyak}</b> dengan jumlah
<b>{$jumlahJenisTerbanyak}</b> data.

Data progres hafalan dapat digunakan sebagai bahan
evaluasi dalam menentukan strategi pembinaan dan
pendampingan santri sesuai dengan kebutuhan masing-masing.

";


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return [

            'intro' => $intro,

            'rekap' => $rekapJenis,

            'total' => $total,

            'lancar' => $lancar,

            'belum' => $belum,

            'persen_lancar' => $persenLancar,

            'persen_belum' => $persenBelum,

            'rasio_lancar_belum' => $rasioLancarBelum,

            'rekap_jenis' => $rekapJenis,

            'jenis_terbanyak' => $jenisTerbanyak,

            'jumlah_jenis_terbanyak' => $jumlahJenisTerbanyak,

            'analysis' => $analysis,

            'conclusion' => $conclusion,

        ];
    }
}
