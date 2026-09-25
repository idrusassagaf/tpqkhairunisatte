@php
$pdfLanguage = $language ?? 'id';

$labels = [
'id' => [
'bab' => 'BAB VII',
'title' => 'PROGRES HAFALAN SANTRI',
'keterangan' => 'Keterangan',
'jumlah' => 'Jumlah',
'total_data_hafalan' => 'Total Data Hafalan',
'rekap_progres' => 'Rekapitulasi Progres Hafalan Santri',
'no' => 'No',
'jenis_hafalan' => 'Jenis Hafalan',
'lancar' => 'Lancar',
'belum' => 'Belum',
],

'en' => [
'bab' => 'CHAPTER VII',
'title' => 'STUDENT MEMORIZATION PROGRESS',
'keterangan' => 'Description',
'jumlah' => 'Total',
'total_data_hafalan' => 'Total Memorization Records',
'rekap_progres' => 'Student Memorization Progress Summary',
'no' => 'No',
'jenis_hafalan' => 'Memorization Type',
'lancar' => 'Fluent',
'belum' => 'Not Yet',
],

'ar' => [
'bab' => 'الفصل السابع',
'title' => 'تقدم حفظ الطلاب',
'keterangan' => 'البيان',
'jumlah' => 'العدد',
'total_data_hafalan' => 'إجمالي بيانات الحفظ',
'rekap_progres' => 'ملخص تقدم حفظ الطلاب',
'no' => 'الرقم',
'jenis_hafalan' => 'نوع الحفظ',
'lancar' => 'متقن',
'belum' => 'لم يتقن بعد',
],
];

$label = $labels[$pdfLanguage] ?? $labels['id'];
@endphp

<h2>{{ $label['bab'] }}</h2>

<h3>{{ $label['title'] }}</h3>

<p style="text-align:justify; line-height:1.8;">

    {{ $setting->narasi['bab7'] ?? '' }}

</p>

<table>

    <tr>
        <th>{{ $label['keterangan'] }}</th>
        <th width="25%">{{ $label['jumlah'] }}</th>
    </tr>

    <tr>
        <td>{{ $label['total_data_hafalan'] }}</td>

        <td align="center">
            {{ $progresHafalan->count() }}
        </td>
    </tr>

</table>

<br>

<h3>{{ $label['rekap_progres'] }}</h3>

<table>

    <tr>
        <th width="8%">{{ $label['no'] }}</th>
        <th>{{ $label['jenis_hafalan'] }}</th>
        <th width="15%">{{ $label['lancar'] }}</th>
        <th width="15%">{{ $label['belum'] }}</th>
        <th width="15%">{{ $label['jumlah'] }}</th>
    </tr>

    @php

    $jenisHafalan = $progresHafalan
    ->pluck('jenis_hafalan')
    ->unique()
    ->sort()
    ->values();

    @endphp

    @foreach($jenisHafalan as $i => $jenis)

    @php

    $lancar = $progresHafalan
    ->where('jenis_hafalan', $jenis)
    ->where('progres', 'Lancar')
    ->count();

    $belum = $progresHafalan
    ->where('jenis_hafalan', $jenis)
    ->where('progres', 'Belum')
    ->count();

    @endphp

    <tr>

        <td align="center">
            {{ $i + 1 }}
        </td>

        <td>
            {{ $jenis }}
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
     ANALISIS DATA BAB VII
     Menggunakan data dari Bab7Report.php
     ========================================================= --}}

<div style="margin-top:6px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab7['analysis'] ?? '') !!}
    </p>

</div>

{{-- =========================================================
     KESIMPULAN BAB VII
     ========================================================= --}}

<div style="margin-top:4px;">

    <p style="text-align:justify; line-height:1.6; margin:0;">
        {!! str_replace('<br><br>', '<br>', $bab7['conclusion'] ?? '') !!}
    </p>

</div>

<div style="page-break-after:always;"></div>