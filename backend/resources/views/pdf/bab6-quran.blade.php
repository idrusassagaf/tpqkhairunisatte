@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'bab' => 'BAB VI',
'title' => "PROGRES PEMBELAJARAN AL-QUR'AN",
'keterangan' => 'Keterangan',
'jumlah' => 'Jumlah',
'total_santri_quran' => "Total Santri Al-Qur'an",
'rekap_progres' => "Rekapitulasi Progres Al-Qur'an Santri",
'no' => 'No',
'juz' => 'Juz',
'hal' => 'Hal',
'l' => 'L',
'b' => 'B',
'l_b' => 'L+B',
],

'en' => [
'bab' => 'CHAPTER VI',
'title' => "AL-QUR'AN LEARNING PROGRESS",
'keterangan' => 'Description',
'jumlah' => 'Total',
'total_santri_quran' => "Total Al-Qur'an Students",
'rekap_progres' => "Al-Qur'an Student Progress Summary",
'no' => 'No',
'juz' => 'Juz',
'hal' => 'Page',
'l' => 'F',
'b' => 'N',
'l_b' => 'F+N',
],

'ar' => [
'bab' => 'الفصل السادس',
'title' => 'تقدم تعلم القرآن الكريم',
'keterangan' => 'البيان',
'jumlah' => 'العدد',
'total_santri_quran' => 'إجمالي طلاب القرآن الكريم',
'rekap_progres' => 'ملخص تقدم طلاب القرآن الكريم',
'no' => 'الرقم',
'juz' => 'جزء',
'hal' => 'الصفحة',
'l' => 'متقن',
'b' => 'لم يتقن',
'l_b' => 'المجموع',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2>{{ $label['bab'] }}</h2>

<h3>{{ $label['title'] }}</h3>

<p style="text-align:justify; line-height:1.8;">

    {!! str_contains($setting->narasi['bab6'] ?? '', '<') ? $setting->narasi['bab6'] : nl2br(e($setting->narasi['bab6'] ?? '')) !!}

</p>

<table>

    <tr>
        <th>{{ $label['keterangan'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    <tr>
        <td>{{ $label['total_santri_quran'] }}</td>

        <td align="center">
            {{ $masterData['santri']->where('kelas','Al Quran')->count() }}
        </td>
    </tr>

</table>

<br>

<h3>{{ $label['rekap_progres'] }}</h3>

<table>

    <tr>
        <th width="8%">{{ $label['no'] }}</th>
        <th width="15%">{{ $label['juz'] }}</th>
        <th>{{ $label['hal'] }}</th>
        <th width="10%">{{ $label['l'] }}</th>
        <th width="10%">{{ $label['b'] }}</th>
        <th width="12%">{{ $label['l_b'] }}</th>
    </tr>

    @php

    $no = 1;

    $dataJuz = $progresQuran->groupBy('juz');

    @endphp

    @foreach($dataJuz as $juz => $items)

    @php

    $halaman = $items
    ->pluck('halaman')
    ->filter()
    ->unique()
    ->sort()
    ->implode('-');

    $lancar = $items
    ->where('progres', 'Lancar')
    ->count();

    $belum = $items
    ->where('progres', 'Belum')
    ->count();

    @endphp

    <tr>

        <td align="center">
            {{ $no++ }}
        </td>

        <td align="center">
            {{ $label['juz'] }} {{ $juz }}
        </td>

        <td align="center">
            {{ $halaman ?: '-' }}
        </td>

        <td align="center">
            {{ $lancar }}
        </td>

        <td align="center">
            {{ $belum }}
        </td>

        <td align="center">
            {{ $lancar + $belum }}
        </td>

    </tr>

    @endforeach

</table>

<br>

{{-- =========================================================
     ANALISIS DATA BAB VI
     Data diambil dari ReportEngine -> Bab6Report
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab6['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN BAB VI
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab6['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>