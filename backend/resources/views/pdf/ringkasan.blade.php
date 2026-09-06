<h2 style="text-align:center;">
    RINGKASAN EKSEKUTIF
</h2>

<div style="
    text-align:justify;
    line-height:1.8;
    margin-bottom:20px;
">
    {!! $setting->narasi['ringkasan'] ?? '' !!}
</div>


{{-- =========================================================
     DATA RINGKASAN
     Fokus pada data inti TPQ:
     Santri, Guru, dan Orang Tua
     ========================================================= --}}

@php

$totalSantri = collect($masterData['santri'])->count();

$totalGuru = collect($masterData['guru'])->count();

$totalOrangTua = collect($masterData['orang_tua'])->count();


/*
|--------------------------------------------------------------------------
| RASIO SANTRI / GURU
|--------------------------------------------------------------------------
*/

$rasioSantriGuru = $totalGuru > 0
? round($totalSantri / $totalGuru, 2)
: 0;


/*
|--------------------------------------------------------------------------
| PERBANDINGAN DATA ORANG TUA DENGAN SANTRI
|--------------------------------------------------------------------------
*/

$persenOrangTua = $totalSantri > 0
? round(($totalOrangTua / $totalSantri) * 100, 2)
: 0;

@endphp


{{-- =========================================================
     TABEL RINGKASAN
     ========================================================= --}}

<table width="100%" border="1" cellspacing="0" cellpadding="6">

    <tr style="background:#eeeeee;">

        <th>
            Data
        </th>

        <th width="120">
            Jumlah
        </th>

    </tr>

    <tr>

        <td>
            Santri
        </td>

        <td align="center">
            {{ $totalSantri }}
        </td>

    </tr>

    <tr>

        <td>
            Guru
        </td>

        <td align="center">
            {{ $totalGuru }}
        </td>

    </tr>

    <tr>

        <td>
            Orang Tua
        </td>

        <td align="center">
            {{ $totalOrangTua }}
        </td>

    </tr>

</table>


<br>


{{-- =========================================================
     ANALISIS DATA
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">

        <b>Analisis Data</b><br>

        Berdasarkan data yang tersimpan dalam Sistem Informasi
        Manajemen TPQ Khairunissa, terdapat sebanyak
        <b>{{ $totalSantri }}</b> santri yang didukung oleh
        <b>{{ $totalGuru }}</b> guru.

        Perbandingan jumlah santri dengan guru menunjukkan
        rasio rata-rata sebesar
        <b>1 : {{ $rasioSantriGuru }}</b>.
        Artinya, secara rata-rata satu guru menangani sekitar
        <b>{{ $rasioSantriGuru }}</b> santri berdasarkan jumlah
        data yang tercatat dalam sistem.

        <br>

        Data orang tua yang tercatat dalam sistem berjumlah
        <b>{{ $totalOrangTua }}</b> data.
        Jumlah tersebut setara dengan sekitar
        <b>{{ $persenOrangTua }}%</b> dibandingkan dengan jumlah
        data santri.

    </p>

</div>


{{-- =========================================================
     KESIMPULAN
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="
        text-align:justify;
        line-height:1.6;
        margin:0;
    ">

        <b>Kesimpulan</b><br>

        Secara keseluruhan, Ringkasan Eksekutif menggambarkan
        kondisi utama TPQ Khairunissa berdasarkan data santri,
        guru, dan orang tua yang tersimpan dalam sistem.

        Perbandingan jumlah santri dan guru memberikan gambaran
        mengenai kapasitas tenaga pengajar dalam mendukung
        proses pembelajaran, sedangkan data orang tua
        memberikan gambaran mengenai keterhubungan data
        keluarga dengan peserta didik.

        Data tersebut dapat menjadi dasar pemantauan kondisi
        kelembagaan, evaluasi pengelolaan, serta bahan
        pertimbangan dalam penyusunan program TPQ pada
        periode berikutnya.

        Seluruh angka dalam ringkasan ini dihasilkan secara
        otomatis berdasarkan data yang tersimpan dalam
        Sistem Informasi Manajemen TPQ Khairunissa.

    </p>

</div>


<div style="page-break-after: always;"></div>